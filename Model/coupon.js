const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    couponCode : {
        type : String,
        unique : true,
        required : true
    },
    couponType : {
        type : String,
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    minimumPurchase : {
        type : Number,
        required : true
    },
    expiryDate : {
        type : Date,
        required : true
    },
    status : {
        type : String,
        default : "List"
    },
    redeemedUsers : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "customer"
    }]
})

const coupon = mongoose.model('coupon', couponSchema);

module.exports = coupon