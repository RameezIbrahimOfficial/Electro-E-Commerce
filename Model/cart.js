const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },
    products: [{
        productId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref : "Product"
        },
        quantity: {
            type: Number,
        }
    }]
});

const cart = mongoose.model("cart", cartSchema);

module.exports = cart; 
