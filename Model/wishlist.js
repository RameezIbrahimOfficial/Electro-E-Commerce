const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },
    products: [{
        productId: {
            type:  mongoose.Schema.Types.ObjectId,
        }
    }]
})

const wishlist = mongoose.model('wishlist',wishlistSchema);
module.exports = wishlist;