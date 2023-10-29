const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    bannerImage: {
        filename: String,
        originalname: String,
        path: String,
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
})

const banner = mongoose.model('banner', bannerSchema);

module.exports = banner;