const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },
    products: [{
        productId: {
            type:  mongoose.Schema.Types.ObjectId,
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
});

const cart = mongoose.model("cart", cartSchema);

module.exports = cart; 