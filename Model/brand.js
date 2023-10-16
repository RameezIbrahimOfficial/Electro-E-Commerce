const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    brandName: {
        type: String,
        required: true
    },
    brandImage: {
        fileName: String,
        mimeType: String,
        buffer: Buffer,
    },
    isBlocked: {
        type: Boolean,
        required: true
    }
})

const brand = mongoose.model('Brand', brandSchema);

module.exports = brand