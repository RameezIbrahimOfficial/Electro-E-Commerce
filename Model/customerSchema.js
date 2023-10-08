const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:Number,
        require:true,
        unique:true
    },
    createdOn:{
        type:String
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})

const customerModel = mongoose.model('Customers',customerSchema)

module.exports = customerModel;