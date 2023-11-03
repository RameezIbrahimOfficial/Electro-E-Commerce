const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const moment = require('moment');
const Razorpay = require('razorpay')
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const JWT_SECRET = process.env.JWT_SECRET;
const RAZOR_PAY_key_id = process.env.RAZOR_PAY_key_id;
const RAZOR_PAY_key_secret = process.env.RAZOR_PAY_key_secret;

const customerModel = require("../Model/customer");
const productsModel = require("../Model/product");
const categoryModel = require("../Model/category");
const brandsModel = require("../Model/brand");
const cartModel = require("../Model/cart");
const addressModel = require("../Model/address");
const wishlistModel = require("../Model/wishlist");
const orderModel = require("../Model/order");
const bannerModel = require('../Model/banner')
const couponModel = require('../Model/coupon')


const razorpay = new Razorpay({
  key_id: RAZOR_PAY_key_id,
  key_secret: RAZOR_PAY_key_secret
})


// Send OTP While New User SignUp
module.exports.getSendOtp = async (req, res) => {
  try {
    phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    }).then(() => {
      res.status(200).json({ data: "Send" });
    })

  } catch (err) {
    next(err)
    console.error(err);
  }
};

// Verify the OTP that have been send and entered by user is Same 
module.exports.getVerifyOtp = async (req, res) => {
  try {
    const phoneNumber = req.query.phoneNumber
    const otp = req.query.otp;
    const verifyOTP = await twilio.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      })
    if (verifyOTP.valid) {
      res.status(200).json({ data: "Verified" })
    } else {
      res.status(500).json({ data: "Incorrect OTP" })
    }

  } catch (err) {
    next(err)
    console.error(err);
  }
};

// Display Home Page
module.exports.getHome = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    let products = await productsModel.find({});
    let brands = await brandsModel.find({});
    const banners = await bannerModel.find({ status: false })
    res.render("home-page", { products, brands, banners, moment, isLogin });
  } catch (err) {
    next(err)
    console.error(err);
  }
};


// POST Account Regsiter 
module.exports.postUserRegister = async (req, res) => {
  try {
    const { fname, lname, email, SignupPassword, phoneNumber } = req.body;
    const isLogin = req.cookies.isLogin;
    bcrypt.hash(SignupPassword, 10, async (err, hash) => {
      await customerModel.create({
        firstName: fname,
        lastName: lname,
        email: email,
        password: hash,
        phoneNumber: phoneNumber,
        createdOn: new Date(),
      }).then((data) => {
        if (data) {
          res.render("page-register", {
            errorMsgSignup: "Account Created Successfully", isLogin
          });
        }
      })
    })

  } catch (err) {
    next(err)
    console.error(err);
  }
};


// Display User Registration Page
module.exports.getUserRegister = (req, res) => {
  const isLogin = req.cookies.isLogin;
  res.render("page-register", { isLogin });
};

// Display User Login Page
module.exports.getUserLogin = (req, res) => {
  const isLogin = req.cookies.isLogin;
  if (isLogin) {
    res.redirect('/')
  } else {
    res.render("page-login", { isLogin });
  }
};

// POST User Login ( Authenticate user )
module.exports.postUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    user = await customerModel.findOne({ email: email });
    const isLogin = req.cookies.isLogin;
    if (user) {
      if (user.isBlocked) {
        res.render("page-login", {
          errorMsgLogin: "You Have Been Blocked by Admin", isLogin
        });
      } else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (email === user.email && result == true) {
            const token = jwt.sign(user.email, JWT_SECRET);
            res.cookie("userToken", token, { maxAge: 24 * 60 * 60 * 1000 });
            res.cookie("isLogin", true, { maxAge: 24 * 60 * 60 * 1000 });
            res.redirect("/products");
          } else {
            res.render("page-login", {
              errorMsgLogin: "Invalid Credentials", isLogin
            });
          }
        })
      }
    } else {
      res.render("page-login", {
        errorMsgLogin: "No User Found on this Email Please Register",
        isLogin,
      });
    }
  } catch (err) {
    next(err)
    console.error(err);
  }
};


// Display products Page
module.exports.getProductsPage = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = 9;
    const isLogin = req.cookies.isLogin;
    const categories = await categoryModel.find({});
    const brands = await brandsModel.find({});
    const products = await productsModel.aggregate([
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ]).exec();
    res.render("products-grid-view", { products, categories, brands, isLogin });
  } catch (err) {
    next(err)
    console.error(err);
  }
};

// Display Indivitual Product page
module.exports.getProductPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const id = req.query.id;
    const product = await productsModel.findOne({ _id: id });
    const brand = await brandsModel.findOne({ brandName: product.brand });
    res.render("shop-product-full", { product, brand, isLogin });
  } catch (err) {
    next(err)
    console.error(err);
  }
};


// Display Cart Page
module.exports.getCartPage = async (req, res) => {
  try {
    const productId = req.query.productId;
    const isLogin = req.cookies.isLogin;
    const user = req.user;
    const userId = await customerModel.findOne({ email: user }, { _id: 1 });
    const userCart = await cartModel.findOne({ userId: userId._id }).populate({
      path: "products.productId",
      model: "Product",
    });
    let grandTotal = 0;
    if (userCart) {
      for (let i = 0; i < userCart.products.length; i++) {
        grandTotal =
          grandTotal +
          userCart.products[i].productId.salePrice *
          userCart.products[i].quantity;
      }
    }
    res.render("cart", { userCart, isLogin, grandTotal });
  } catch (err) {
    next(err)
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Add products to CART ( POST )
module.exports.postAddToCart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const quantity = Number(req.body.quantity);
    if (productId) {
      const currentUser = await customerModel.findOne({ email: req.user });
      if (!currentUser) {
        return res.redirect("/signin");
      }
      const userCart = await cartModel.findOne({ userId: currentUser._id });
      if (userCart) {
        let productIndex = -1;
        productIndex = userCart.products.findIndex((product) => product.productId == productId
        );

        if (productIndex !== -1) {
          userCart.products[productIndex].quantity += quantity;
        } else {
          userCart.products.push({ productId, quantity: quantity });
        }

        await userCart.save();
      } else {
        const newCart = new cartModel({
          userId: currentUser._id,
          products: [{ productId, quantity: 1 }],
        });
        await newCart.save();
      }
      res.status(200).json({ data: productId });
    }
  } catch (error) {
    next(error)
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete products from CART 
module.exports.getDeleteCart = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.query.productId;
    const userDocument = await customerModel.findOne({ email: user });
    if (!userDocument) {
      return res.status(404).send("User not found");
    }
    const userId = userDocument._id;
    await cartModel.updateOne(
      { userId },
      {
        $pull: { products: { productId: productId } },
      }
    );
    res.redirect("/cart");
  } catch (error) {
    next(error)
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Update Cart Quanity on Cart Quantity Increment
module.exports.postCartUpdate = async (req, res) => {
  try {
    const productId = req.body.productId;
    const quantity = Number(req.body.quantity);

    if (productId && quantity) {
      const currentUser = await customerModel.findOne({ email: req.user });

      if (!currentUser) {
        return res.redirect("/signin");
      }

      let userCart = await cartModel.findOne({ userId: currentUser._id });
      if (!userCart) {
        userCart = new cartModel({
          userId: currentUser._id,
          products: [{ productId, quantity }],
        });
      } else {
        const productIndex = userCart.products.findIndex(
          (product) => product.productId == productId
        );

        if (productIndex !== -1) {
          userCart.products[productIndex].quantity = quantity;
        } else {
          userCart.products.push({ productId, quantity });
        }
      }

      await userCart.save();
      res.status(200).json({ message: "Updated Cart" });
    } else {
      res.status(400).json({ message: "Invalid input" });
    }
  } catch (error) {
    next(error)
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Display Contact Page
module.exports.getContactPage = (req, res) => {
  const isLogin = req.cookies.isLogin;
  res.render("page-contact", { isLogin });
};


//  User Logout 
module.exports.getUserLogout = async (req, res) => {
  try {
    res.clearCookie("userToken");
    res.clearCookie("isLogin");
    res.redirect("/");
  } catch (err) {
    next(err)
    console.error(err);
  }
};

// User Product Search 
module.exports.getSearch = async (req, res) => {
  try {
    const product_search = req.query.product_search;
    const search_category = req.query.category;
    const isLogin = req.cookies.isLogin;
    const categories = await categoryModel.find({});
    const brands = await brandsModel.find({});
    if (search_category) {
      const products = await productsModel.find({ category: search_category });
      res.render("products-grid-view", {
        products,
        categories,
        brands,
        isLogin,
      });
    }
    if (product_search) {
      const products = await productsModel.find({
        productName: { $regex: `^${product_search}`, $options: "xi" },
      });
      res.render("products-grid-view", {
        products,
        categories,
        brands,
        isLogin,
      });
    }
  } catch (err) {
    next(err)
    console.error(err);
  }
};


// Filter Products in Products Page
module.exports.postSearch = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    const brands = await brandsModel.find({});
    const isLogin = req.cookies.isLogin;
    const {
      ram,
      price,
      brand,
      internal_memory,
      battery_capacity,
      operating_system,
    } = req.body;
    const aggregationStages = [];
    const orConditions = [];
    const ramArray = [],
      priceArray = [],
      internal_memoryArray = [],
      brandArray = [],
      battery_capacityArray = [],
      operating_systemArray = [];

    // Build an array of $or conditions for each field with multiple values
    if (ram && ram.length > 0) {
      if (Array.isArray(ram)) {
        orConditions.push({ ram: { $in: ram.map(Number) } });
      } else {
        ramArray.push(ram);
        orConditions.push({ ram: { $in: ramArray.map(Number) } });
      }
    }

    if (price && price.length > 0) {
      if (Array.isArray(price)) {
        orConditions.push({ salePrice: { $in: price.map(Number) } });
      } else {
        priceArray.push(price);
        orConditions.push({ salePrice: { $in: priceArray.map(Number) } });
      }
    }

    if (brand && brand.length > 0) {
      if (Array.isArray(brand)) {
        orConditions.push({ brand: { $in: brand } });
      } else {
        brandArray.push(brand);
        orConditions.push({ brand: { $in: brandArray } });
      }
    }

    if (internal_memory && internal_memory.length > 0) {
      if (Array.isArray(internal_memory)) {
        orConditions.push({
          internalMemory: { $in: internal_memory.map(Number) },
        });
      } else {
        internal_memoryArray.push(internal_memory);
        orConditions.push({
          internalMemory: { $in: internal_memoryArray.map(Number) },
        });
      }
    }

    if (battery_capacity && battery_capacity.length > 0) {
      if (Array.isArray(battery_capacity)) {
        orConditions.push({
          batteryCapacity: { $in: battery_capacity.map(Number) },
        });
      } else {
        battery_capacityArray.push(battery_capacity);
        orConditions.push({
          batteryCapacity: { $in: battery_capacityArray.map(Number) },
        });
      }
    }

    if (operating_system && operating_system.length > 0) {
      if (Array.isArray(operating_system)) {
        orConditions.push({ category: { $in: operating_system } });
      } else {
        operating_systemArray.push(operating_system);
        orConditions.push({ category: { $in: operating_systemArray } });
      }
    }

    if (orConditions.length > 0) {
      aggregationStages.push({
        $match: {
          $or: orConditions,
        },
      });
    }

    if (aggregationStages.length > 0) {
      const products = await productsModel.aggregate(aggregationStages);
      res.render("products-grid-view", {
        products,
        categories,
        brands,
        isLogin,
      });
    } else {
      const products = await productsModel.find({});
      res.render("products-grid-view", {
        products,
        categories,
        brands,
        isLogin,
      });
    }
  } catch (err) {
    next(err)
    console.error(err);
  }
};

// Display user Profile Page
module.exports.getProfile = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const userEmail = req.user;
    const user = await customerModel.findOne({ email: userEmail });
    const userAddress = await addressModel.findOne({ userId: user._id });
    const coupons = await couponModel.find({})
    const orders = await orderModel.aggregate([
      { $match: { customerId: user._id } },
      { $sort: { createdOn: -1 } }
    ]);
    const { firstName, lastName } = await customerModel.findOne(
      { email: userEmail },
      { firstName: 1, lastName: 1 }
    );
    res.render("page-account", {
      userName: firstName + " " + lastName,
      userAddress,
      isLogin,
      orders,
      moment,
      user,
      coupons
    });
  } catch (error) {
    next(error)
    console.error(error);
  }
};


// Display Add address Page
module.exports.getAddAddressPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    res.render("page-address", { isLogin });
  } catch (error) {
    next(error)
    console.error(error);
  }
};

// Add User Address to DB 
module.exports.postAddAddress = async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.user }, { _id: 1 });
    const {
      addressType,
      name,
      city,
      landMark,
      state,
      pincode,
      phone,
      altPhone,
    } = req.body;
    const userAddress = await addressModel.findOne({ userId: user._id });
    if (!userAddress) {
      const newAddress = new addressModel({
        userId: user._id,
        address: [
          {
            addressType,
            name,
            city,
            landMark,
            state,
            pincode,
            phone,
            altPhone,
          },
        ],
      });
      await newAddress.save();
    } else {
      userAddress.address.push({
        addressType,
        name,
        city,
        landMark,
        state,
        pincode,
        phone,
        altPhone,
      });
    }
    await userAddress.save();
    res.redirect("/profile");
  } catch (error) {
    next(error)
    console.error(error);
  }
};

// Delete User Address 
module.exports.getAddressDelete = async (req, res) => {
  try {
    addressId = req.query.id;
    const user = await customerModel.findOne({ email: req.user }, { _id: 1 });
    const currAddress = await addressModel.findOne({
      "address._id": addressId,
    });
    if (currAddress) {
      await addressModel.updateOne(
        { userId: user._id },
        {
          $pull: { address: { _id: addressId } },
        }
      );
    }
    res.redirect("/profile");
  } catch (error) {
    next(error)
    console.error(error);
  }
};

// Display user Address Edit Page
module.exports.getAddressEdit = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const addressId = req.query.id;
    const currAddress = await addressModel.findOne({
      "address._id": addressId,
    });

    if (currAddress && currAddress.address) {
      const matchingAddress = currAddress.address.find(
        (item) => item._id == addressId
      );
      res.render("page-edit-address", { isLogin, matchingAddress });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    next(error)
    console.error(error);
  }
};

// Update DB with updated Address Details
module.exports.postAddressEdit = async (req, res) => {
  try {
    const {
      addressType,
      name,
      city,
      landMark,
      state,
      pincode,
      phone,
      altPhone,
    } = req.body;
    const addressId = req.query.id;
    const currAddress = await addressModel.findOne({
      "address._id": addressId,
    });

    if (currAddress && currAddress.address) {
      const matchingAddress = currAddress.address.find(
        (item) => item._id == addressId
      );

      if (matchingAddress) {
        await addressModel.updateOne(
          { "address._id": addressId },
          {
            $set: {
              "address.$": {
                addressType,
                name,
                city,
                landMark,
                state,
                pincode,
                phone,
                altPhone,
              },
            },
          }
        ).then(() => {
          res.redirect("/profile");
        })
      }
      res.redirect("/profile");
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    next(error)
    console.error(error);
  }
};

// Display Wishlist Page
module.exports.getWishlistPage = async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.user }, { _id: 1 })
    const userWishlist = await wishlistModel.findOne({ userId: user._id }).populate({
      path: "products.productId",
      model: "Product",
    });
    const isLogin = req.cookies.isLogin;
    res.render("wishlist", { isLogin, userWishlist });
  } catch (error) {
    next(error)
    console.error(error);
  }
};


// Add products to Wishlist
module.exports.postAddToWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;
    if (productId) {
      const currentUser = await customerModel.findOne({ email: req.user });
      if (!currentUser) {
        return res.redirect("/signin");
      }
      const userWishlist = await wishlistModel.findOne({
        userId: currentUser._id,
      });
      if (userWishlist) {
        let productIndex = -1;
        productIndex = userWishlist.products.findIndex((product) => product.productId == productId)

        if (productIndex === -1) {
          userWishlist.products.push({ productId });
          await userWishlist.save();
        }
      } else {
        const newWishlist = new wishlistModel({
          userId: currentUser._id,
        });
        await newWishlist.save();
      }
      res.status(200).json({ message: "Added to Wishlist" });
    }
  } catch (error) {
    next(error)
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Product from Wishlist
module.exports.getDeleteWishlist = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.query.productId;
    const userDocument = await customerModel.findOne({ email: user });
    if (!userDocument) {
      return res.status(404).send("User not found");
    }
    const userId = userDocument._id;
    await wishlistModel.updateOne(
      { userId },
      {
        $pull: { products: { productId: productId } },
      }
    );
    res.redirect("/wishlist");
  } catch (error) {
    next(error)
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Display Checkout Page
module.exports.getCheckoutPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const user = await customerModel.findOne({ email: req.user });
    const userAddress = await addressModel.findOne({ userId: user._id });
    const userCart = await cartModel
      .findOne({ userId: user._id })
      .populate({
        path: "products.productId",
        model: "Product",
      });
    if (userCart && userCart.products.length > 0) {
      let grandTotal = 0;
      const stockCheck = [];
      for (let i = 0; i < userCart.products.length; i++) {
        const product = userCart.products[i].productId;
        const quantityInCart = userCart.products[i].quantity;

        if (quantityInCart > product.units) {
          stockCheck.push(
            `Product "${product.productName}" has only ${product.units} units available.`
          );
        }

        grandTotal += product.salePrice * quantityInCart;
      }

      res.render('checkout', { isLogin, userAddress, userCart, grandTotal, stockCheck });
    } else {
      res.redirect('/products')
    }
  } catch (error) {
    next(error)
    console.error(error);
  }
};

// Place order COD ( Cash on Delivery )
module.exports.getPlaceOrderCOD = async (req, res) => {
  try {
    const { grantTotal, couponCode } = req.query;
    let totalAmount = 0;
    const coupon = await couponModel.findOne({ couponCode: couponCode });
    const user = await customerModel.findOne({ email: req.user });
    let discountAmount = 0;
    if (coupon) {
      discountAmount = coupon.amount;
    }
    const cart = await cartModel.findOne({ userId: user._id }).populate({
      path: 'products.productId',
      model: 'Product'
    })
    const address = await addressModel.findOne({ "address._id": req.query.addressId }, { "address.$": 1 });
    const productArray = [];
    cart.products.forEach((product) => {
      productArray.push({
        productId: product.productId._id,
        quantity: product.quantity,
        price: product.productId.salePrice
      })
    })
    cart.products.forEach((product) => {
      totalAmount += product.quantity * product.productId.salePrice;
    })
    await orderModel.create({
      customerId: user._id,
      products: productArray,
      address: {
        addressType: address.address[0].addressType,
        name: address.address[0].name,
        city: address.address[0].city,
        landMark: address.address[0].landMark,
        state: address.address[0].state,
        pincode: address.address[0].pincode,
        phone: address.address[0].phone,
        altPhone: address.address[0].altPhone
      },
      paymentMethod: "COD",
      referenceId: "order_qw4567854",
      shippingCharge: 0,
      discount: discountAmount,
      totalAmount: grantTotal,
      createdOn: new Date(),
      orderStatus: "Order Placed",
      paymentStatus: "Pending",
      deliveredOn: new Date(),
      couponCode: couponCode
    }).then(async () => {
      for (const product of cart.products) {
        await productsModel.updateOne(
          { _id: product.productId._id },
          { $inc: { units: -product.quantity } }
        );
      }
      await cartModel.deleteOne({ userId: user._id });
    })
    res.render('order-placed')
  } catch (error) {
    // next(error)
    console.error(error);
  }
}

// Place Order ( Online Payement methods using RazorPay )
module.exports.getPlaceOrderOnline = async (req, res) => {
  try {
    const { grantTotal, couponCode } = req.query;
    let totalAmount = 0;
    const user = await customerModel.findOne({ email: req.user });
    const cart = await cartModel.findOne({ userId: user._id }).populate({
      path: 'products.productId',
      model: 'Product'
    });
    const address = await addressModel.findOne({ "address._id": req.query.addressId }, { "address.$": 1 });
    const productArray = [];

    cart.products.forEach((product) => {
      productArray.push({
        productId: product.productId._id,
        quantity: product.quantity,
        price: product.productId.salePrice
      });
    });

    cart.products.forEach((product) => {
      totalAmount += product.quantity * product.productId.salePrice;
    });

    var options = {
      amount: grantTotal * 100,
      currency: "INR",
      receipt: uuidv4(),
      payment_capture: "1"
    };

    const newOrder = await razorpay.orders.create(options);

    await orderModel.create({
      customerId: user._id,
      products: productArray,
      address: {
        addressType: address.address[0].addressType,
        name: address.address[0].name,
        city: address.address[0].city,
        landMark: address.address[0].landMark,
        state: address.address[0].state,
        pincode: address.address[0].pincode,
        phone: address.address[0].phone,
        altPhone: address.address[0].altPhone
      },
      paymentMethod: "Online",
      referenceId: newOrder.id,
      shippingCharge: 0,
      discount: 0,
      totalAmount: grantTotal,
      createdOn: new Date(),
      orderStatus: "Order Placed",
      paymentStatus: "Pending",
      deliveredOn: new Date(),
      couponCode: couponCode
    });

    for (const product of cart.products) {
      await productsModel.updateOne(
        { _id: product.productId._id },
        { $inc: { units: -product.quantity } }
      );
    }

    await cartModel.deleteOne({ userId: user._id });

    res.status(200).json({ order_id: newOrder.id });
  } catch (error) {
    // next(error)
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle Payement Status on DB on Success and Failure of Payement Through Razorpay
module.exports.postUpdatePaymentStatus = async (req, res) => {
  try {

    const { paymentStatus, orderId, response, couponCode } = req.query;
    const coupon = await couponModel.findOne({ couponCode: couponCode })
    let discountAmount = 0;
    if (coupon) {
      discountAmount = coupon.amount
    }

    if (paymentStatus === 'Success') {
      await orderModel.updateOne({ referenceId: orderId }, { $set: { paymentStatus: 'Success', discount: discountAmount } });
      res.redirect('/profile')
    } else {
      await orderModel.updateOne({ referenceId: orderId }, { $set: { paymentStatus: 'Failure', discount: discountAmount } });
      const order = await orderModel.findOne({ referenceId: orderId });
      if (order) {
        for (const item of order.products) {
          await productsModel.updateOne(
            { _id: item.productId },
            { $inc: { units: item.quantity } }
          );
        }
      }
      res.redirect('/profile')

    }
  } catch (error) {
    // next(error)
    console.error(error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Display Invoice Page
module.exports.getInvoice = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await orderModel.findOne({ _id: orderId })
      .populate({
        path: 'products.productId',
        model: 'Product'
      });
    const isLogin = req.cookies.isLogin;
    res.render('invoice', { isLogin, order })
  } catch (error) {
    next(error)
    console.error(error)
  }
}


// Cancel Placed Order
module.exports.getOrderCancel = async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.user });
    const orderId = req.query.orderId;
    if (user) {
      await orderModel.updateOne({ _id: orderId }, { $set: { orderStatus: "Canceled" } });
      const order = await orderModel.findOne({ _id: orderId });
      order.products.forEach(async (product) => {
        await productsModel.updateOne({ _id: product.productId }, { $inc: { units: product.quantity } })
      })

      res.redirect('/profile')
    } else {
      res.redirect('/')
    }
  } catch (error) {
    next(error)
    console.error(error)
  }
}

// Return Delivered Product
module.exports.getOrderReturn = async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.user });
    const orderId = req.query.orderId;
    if (user) {
      await orderModel.updateOne({ _id: orderId }, { $set: { orderStatus: "Returned" } })
      const order = await orderModel.findOne({ _id: orderId });
      order.products.forEach(async (product) => {
        await productsModel.updateOne({ _id: product.productId }, { $inc: { units: product.quantity } })
      })
      res.redirect('/profile')
    } else {
      res.redirect('/')
    }
  } catch (error) {
    next(error)
    console.error(error)
  }
}

// Display Forget Password Page 
module.exports.getPasswordResetPage = (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    res.render('forget-password', { isLogin })
  } catch (error) {
    next(error);
    console.error(error)
  }
}

// Send Password Reset OTP 
module.exports.getSendOtpPasswordReset = async (req, res) => {
  try {
    const userEmail = req.query.email;
    const user = await customerModel.findOne({ email: userEmail })
    if (user) {
      await twilio.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
        to: `+91${user.phoneNumber}`,
        channel: "sms",
      }).then(() => {
        res.status(200).json({ data: "Send" });
      })
    } else {
      res.status(500).json({ data: "No user with this email" })
    }
  } catch (err) {
    next(err)
    console.error(err);
  }
}

// Verify Password Reset OTP
module.exports.getVerifyOtpPasswordReset = async (req, res) => {
  try {
    const otp = req.query.otp;
    const email = req.query.email
    const user = await customerModel.findOne({ email: email })
    const verifyOTP = await twilio.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${user.phoneNumber}`,
        code: otp,
      })
    if (verifyOTP.valid) {
      res.status(200).json({ data: "Verified" })
    } else {
      res.status(500).json({ data: "Incorrect OTP" })
    }

  } catch (err) {
    next(err)
    console.error(err);
  }
}

// Display New Password Page
module.exports.getchangePasswordPage = async (req, res) => {
  try {
    const userEmail = req.query.email;
    const isLogin = req.cookies.isLogin;

    res.render('change-password', { isLogin, userEmail })
  } catch (error) {
    next(error);
    console.error(error)
  }
}

// Update DB with new New Password
module.exports.postNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body
    bcrypt.hash(password, 10, async (err, hash) => {
      await customerModel.updateOne({ email: email }, {
        $set: {
          password: hash
        }
      })
    })
    res.status(200).json({ Data: "Password Updated" })
  } catch (error) {
    next(error)
    console.error(error)
    res.status(500).json({ Data: "Password Updation Failed" })
  }
}

//Update User Details Into DB
module.exports.postUpdateUserDetails = async (req, res) => {
  try {
    const { firstName, lastName, email, password, newPassword } = req.body;
    const user = await customerModel.findOne({ email: req.user });
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const salt = await bcrypt.hash(newPassword, 10);

      await customerModel.updateOne({ email: email }, {
        $set: {
          firstName,
          lastName,
          email,
          password: salt
        }
      });

      res.status(200).json({ data: "Data Updated" });
    } else {
      res.status(500).json({ data: "Current Password Incorrect" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ data: "An error occurred" });
  }
};

// Redeem Coupon While Checkout
module.exports.postRedeemCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const user = await customerModel.findOne({ email: req.user });
    const coupon = await couponModel.findOne({ couponCode: couponCode });
    if (!coupon) {
      return res.status(500).json({ data: "No coupon Found" });
    }

    const isRedeemed = coupon.redeemedUsers.some((redeemedUser) => redeemedUser.equals(user._id));

    if (isRedeemed) {
      return res.status(500).json({ data: "Coupon Already Redeemed By user" });
    } else {
      coupon.redeemedUsers.push(user._id);
      await coupon.save();
      return res.status(200).json({ data: "Coupon Found", coupon: coupon });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: "An error occurred" });
  }
};
