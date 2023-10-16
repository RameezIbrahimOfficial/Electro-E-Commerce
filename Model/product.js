const mongoose = require("mongoose");

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
    type: Boolean,
    required: true,
  },
  units: {
    type: Number,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  productImage: [
    {
      fileName: String,
      mimeType: String,
      buffer: Buffer,
    },
  ],
  operatingSystem: {
    type: String,
    required: true,
  },
  cellularTechnology: {
    type: String,
    required: true,
  },
  internalMemory: {
    type: Number,
    required: true,
  },
  ram: {
    type: Number,
    required: true,
  },
  screenSize: {
    type: Number,
    required: true,
  },
  batteryCapacity: {
    type: Number,
    required: true,
  },
  processor: {
    type: String,
    required: true,
  },
});

const product = mongoose.model("Product", productSchema);

module.exports = product;
