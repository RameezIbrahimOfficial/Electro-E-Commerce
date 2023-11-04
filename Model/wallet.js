const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'customer'
    },
    amount : {
        type : Number
    }
})

const wallet = mongoose.model('wallet',walletSchema);

module.exports = wallet;