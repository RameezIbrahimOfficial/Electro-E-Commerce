const { v4: uuidv4 } = require("uuid");
const Razorpay = require("razorpay");
require("dotenv").config();

const { JWT_SECRET, RAZOR_PAY_key_id, RAZOR_PAY_key_secret } = process.env;

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: RAZOR_PAY_key_id,
  key_secret: RAZOR_PAY_key_secret,
});

const { customerModel, orderModel, productModel, walletModel, couponModel, cartModel, addressModel } = require("../../Model");

// Place order COD ( Cash on Delivery )
const getPlaceOrderCOD = async (req, res) => {
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
      path: "products.productId",
      model: "Product",
    });
    const address = await addressModel.findOne(
      { "address._id": req.query.addressId },
      { "address.$": 1 }
    );
    const productArray = [];
    cart.products.forEach((product) => {
      productArray.push({
        productId: product.productId._id,
        quantity: product.quantity,
        price: product.productId.salePrice,
      });
    });
    cart.products.forEach((product) => {
      totalAmount += product.quantity * product.productId.salePrice;
    });
    await orderModel
      .create({
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
          altPhone: address.address[0].altPhone,
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
        couponCode: couponCode,
      })
      .then(async () => {
        for (const product of cart.products) {
          await productModel.updateOne(
            { _id: product.productId._id },
            { $inc: { units: -product.quantity } }
          );
        }
        await cartModel.deleteOne({ userId: user._id });
      });
    res.render("order-placed");
  } catch (error) {
    //
    console.error(error);
  }
};

// Place Order ( Online Payement methods using RazorPay )
const getPlaceOrderOnline = async (req, res) => {
  try {
    const { grantTotal, couponCode } = req.query;
    let totalAmount = 0;
    const user = await customerModel.findOne({ email: req.user });
    const cart = await cartModel.findOne({ userId: user._id }).populate({
      path: "products.productId",
      model: "Product",
    });
    const address = await addressModel.findOne(
      { "address._id": req.query.addressId },
      { "address.$": 1 }
    );
    const productArray = [];

    cart.products.forEach((product) => {
      productArray.push({
        productId: product.productId._id,
        quantity: product.quantity,
        price: product.productId.salePrice,
      });
    });

    cart.products.forEach((product) => {
      totalAmount += product.quantity * product.productId.salePrice;
    });

    var options = {
      amount: grantTotal * 100,
      currency: "INR",
      receipt: uuidv4(),
      payment_capture: "1",
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
        altPhone: address.address[0].altPhone,
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
      couponCode: couponCode,
    });

    for (const product of cart.products) {
      await productModel.updateOne(
        { _id: product.productId._id },
        { $inc: { units: -product.quantity } }
      );
    }

    await cartModel.deleteOne({ userId: user._id });

    res.status(200).json({ order_id: newOrder.id });
  } catch (error) {
    //
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle Payement Status on DB on Success and Failure of Payement Through Razorpay
const postUpdatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, orderId, response, couponCode } = req.query;
    const coupon = await couponModel.findOne({ couponCode: couponCode });
    let discountAmount = 0;
    if (coupon) {
      discountAmount = coupon.amount;
    }

    if (paymentStatus === "Success") {
      await orderModel.updateOne(
        { referenceId: orderId },
        { $set: { paymentStatus: "Success", discount: discountAmount } }
      );
      res.redirect("/profile");
    } else {
      await orderModel.updateOne(
        { referenceId: orderId },
        { $set: { paymentStatus: "Failure", discount: discountAmount } }
      );
      const order = await orderModel.findOne({ referenceId: orderId });
      if (order) {
        for (const item of order.products) {
          await productModel.updateOne(
            { _id: item.productId },
            { $inc: { units: item.quantity } }
          );
        }
      }
      res.redirect("/profile");
    }
  } catch (error) {
    //
    console.error(error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};

// Display Invoice Page
const getInvoice = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await orderModel.findOne({ _id: orderId }).populate({
      path: "products.productId",
      model: "Product",
    });
    const isLogin = req.cookies.isLogin;
    res.render("invoice", { isLogin, order });
  } catch (error) {
    console.error(error);
  }
};

// Cancel Placed Order
const getOrderCancel = async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.user });
    const orderId = req.query.orderId;
    if (user) {
      await orderModel.updateOne(
        { _id: orderId },
        { $set: { orderStatus: "Canceled" } }
      );
      const order = await orderModel.findOne({ _id: orderId });
      order.products.forEach(async (product) => {
        await productModel.updateOne(
          { _id: product.productId },
          { $inc: { units: product.quantity } }
        );
      });

      const newOrder = await orderModel.findOne({ _id: orderId });
      const wallet = await walletModel.findOne({ userId: user._id })
      const walletAmount = wallet.amount ?? 0;
      const totalOrderAmount = newOrder.totalAmount ?? 0;
      const newWalletAmount = walletAmount + totalOrderAmount
      if (newOrder.paymentStatus === 'Success') {
        await walletModel.updateOne({ userId: user._id }, {
          $set: {
            amount: newWalletAmount
          }
        })
      }

      res.redirect("/profile");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
  }
};

// Return Delivered Product
const getOrderReturn = async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.user });
    const orderId = req.query.orderId;
    if (user) {
      await orderModel.updateOne(
        { _id: orderId },
        { $set: { orderStatus: "Returned" } }
      );
      const order = await orderModel.findOne({ _id: orderId });
      order.products.forEach(async (product) => {
        await productModel.updateOne(
          { _id: product.productId },
          { $inc: { units: product.quantity } }
        );
      });

      const newOrder = await orderModel.findOne({ _id: orderId });
      const wallet = await walletModel.findOne({ userId: user._id })
      const walletAmount = wallet.amount ?? 0;
      const totalOrderAmount = newOrder.totalAmount ?? 0;
      const newWalletAmount = walletAmount + totalOrderAmount
      if (newOrder.paymentStatus === 'Success') {
        await walletModel.updateOne({ userId: user._id }, {
          $set: {
            amount: newWalletAmount
          }
        })
      }

      res.redirect("/profile");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getPlaceOrderCOD,
  getPlaceOrderOnline,
  postUpdatePaymentStatus,
  getInvoice,
  getOrderCancel,
  getOrderReturn
}