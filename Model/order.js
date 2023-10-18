const mongoose = require('mongoose');

const orderModel = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },
    products: [{
        productId: {
            type:  mongoose.Schema.Types.ObjectId,
            ref : 'Product'
        },
        quantity: {
            type: Number,
        },
        price : {
            type : Number
        }
    }],
    address : {
       addressType : String,
       name : String,
       city : String,
       landMark : String,   
       state : String,
       pincode : Number,
       phone : Number,
       altPhone : Number
    },
    payementMethod : String,
    refernceId : String,
    shippingCharge : Number,
    discount : Number,
    totalAmount : Number,
    CreatedOn : Date,
    status : String,
    deliveredOn : Date,
});

const order = mongoose.model("order", orderModel);

module.exports = order; 
