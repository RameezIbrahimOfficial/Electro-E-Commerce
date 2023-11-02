const mongoose = require('mongoose');

const orderModel = mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  address: {
    addressType: String,
    name: String,
    city: String,
    landMark: String,
    state: String,
    pincode: Number,
    phone: Number,
    altPhone: Number
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  referenceId: {
    type: String,
    required: true,
  },
  shippingCharge: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  couponCode : {
    type : String
  },
  createdOn: {
    type: Date,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  deliveredOn: {
    type: Date,
    required: true,
  },
});

const order = mongoose.model("order", orderModel);

module.exports = order; 
