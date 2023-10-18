const jwt = require("jsonwebtoken");
require("dotenv").config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const JWT_SECRET = process.env.JWT_SECRET;

const customerModel = require("../Model/customer");
const productsModel = require("../Model/product");
const categoryModel = require("../Model/category");
const brandsModel = require("../Model/brand");
const cartModel = require("../Model/cart");
const addressModel = require("../Model/address");
const wishlistModel = require("../Model/wishlist");

let phoneNumber;
let isOtpVerified;

module.exports.getSendOtp = async (req, res) => {
  try {
    phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports.getVerifyOtp = async (req, res) => {
  try {
    const otp = req.query.otp;
    const verifyOTP = await twilio.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      isOtpVerified = true;
    } else {
      isOtpVerified = false;
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getHome = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    let products = await productsModel.find({});
    let brands = await brandsModel.find({});
    res.render("home-page", { products, brands, isLogin });
  } catch (err) {
    console.error(err);
  }
};

module.exports.postUserRegister = async (req, res) => {
  try {
    const { fname, lname, email, SignupPassword, phoneNumber } = req.body;
    const isLogin = req.cookies.isLogin;
    if (isOtpVerified) {
      await customerModel.create({
        firstName: fname,
        lastName: lname,
        email: email,
        password: SignupPassword,
        phoneNumber: phoneNumber,
        createdOn: new Date(),
      });
      res.render("page-register", {
        errorMsgSignup: "Account Created Successfully",
      });
    } else {
      res.render("page-register", {
        errorMsgOTP: "Invalid OTP",
        isLogin,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getUserRegister = (req, res) => {
  const isLogin = req.cookies.isLogin;
  res.render("page-register", { isLogin });
};
module.exports.getUserLogin = (req, res) => {
  const isLogin = req.cookies.isLogin;
  res.render("page-login", { isLogin });
};

module.exports.postUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    user = await customerModel.findOne({ email: email });
    const isLogin = req.cookies.isLogin;
    if (user) {
      if (user.isBlocked) {
        res.render("page-login", {
          errorMsgLogin: "You Have Been Blocked by Admin",
        });
      } else {
        if (email === user.email && password === user.password) {
          const token = jwt.sign(user.email, JWT_SECRET);
          res.cookie("userToken", token, { maxAge: 24 * 60 * 60 * 1000 });
          res.cookie("isLogin", true, { maxAge: 24 * 60 * 60 * 1000 });
          res.redirect("/products");
        } else {
          res.render("page-login", {
            errorMsgLogin: "Invalid Credentials",
          });
        }
      }
    } else {
      res.render("page-login", {
        errorMsgLogin: "No User Found on this Email Please Register",
        isLogin,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getProductsPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const products = await productsModel.find({});
    const categories = await categoryModel.find({});
    const brands = await brandsModel.find({});
    res.render("products-grid-view", { products, categories, brands, isLogin });
  } catch (err) {
    console.error(err);
  }
};

module.exports.getProductPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const id = req.query.id;
    const product = await productsModel.findOne({ _id: id });
    const brand = await brandsModel.findOne({ brandName: product.brand });
    res.render("shop-product-full", { product, brand, isLogin });
  } catch (err) {
    console.error(err);
  }
};

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
    console.log(userCart)
    for (let i = 0; i < userCart.products.length; i++) {
      grandTotal =
        grandTotal +
        userCart.products[i].productId.salePrice *
          userCart.products[i].quantity;
    }
    res.render("cart", { userCart, isLogin, grandTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

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
        for (let i = 0; i < userCart.products.length; i++) {
          if (productId == userCart.products[i].productId) {
            productIndex = i;
            break;
          }
        }

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
      res.status(200).json({ message: "Added to Cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

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
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getContactPage = (req, res) => {
  const isLogin = req.cookies.isLogin;
  res.render("page-contact", { isLogin });
};

module.exports.getUserLogout = async (req, res) => {
  try {
    res.clearCookie("userToken");
    res.clearCookie("isLogin");
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
};

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
    console.error(err);
  }
};

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
    console.error(err);
  }
};

module.exports.getPorfile = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const userEmail = req.user;
    const user = await customerModel.findOne({ email: userEmail }, { _id: 1 });
    const userAddress = await addressModel.findOne({ userId: user._id });
    const { firstName, lastName } = await customerModel.findOne(
      { email: userEmail },
      { firstName: 1, lastName: 1 }
    );
    res.render("page-account", {
      userName: firstName + " " + lastName,
      userAddress,
      isLogin,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports.getAddAddressPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    res.render("page-address", { isLogin });
  } catch (error) {
    console.log(error);
  }
};

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
    console.error(error);
  }
};

module.exports.getAddressDelete = async (req, res) => {
  try {
    addressId = req.query.id;
    const user = await customerModel.findOne({ email: req.user }, { _id: 1 });
    const currAddress = await addressModel.findOne({
      "address._id": addressId,
    });
    console.log(currAddress);
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
    console.error(error);
  }
};

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
    console.error(error);
  }
};

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
        );

        res.redirect("/profile");
        res.redirect("/profile");
      }
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports.getWishlistPage = async (req, res) => {
  try {
    const user = await customerModel.findOne({email:req.user},{_id:1})
    const userWishlist = await wishlistModel.findOne({ userId: user._id }).populate({
      path: "products.productId",
      model: "Product",
    });
    const isLogin = req.cookies.isLogin;
    res.render("wishlist", { isLogin, userWishlist });
  } catch (error) {
    console.error(error);
  }
};

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
        for (let i = 0; i < userWishlist.products.length; i++) {
          if (productId == userWishlist.products[i].productId) {
            productIndex = i;
            break;
          }
        }

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
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getDeleteWishlist = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.query.productId;
    console.log(productId)
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
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};