const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  regularPrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  createdOn: {
    type: Date,
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  units: {
    type: Number,
    required: true,
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
  productImage: [{
    fileName: String,
    mimeType: String,
    buffer: Buffer,
  }],
});

const productsModel = mongoose.model('Product', productSchema);

module.exports = productsModel;
