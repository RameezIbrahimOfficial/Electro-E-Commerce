const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const {TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_SERVICE_SID} = process.env
const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})

const customerModel = require('../Model/customerSchema');
const productModel = require('../Model/productSchema')
const categoryModel = require('../Model/categorySchema')

const userRouter = express.Router();

userRouter.use(express.static('public'))
userRouter.use(express.json());
userRouter.use(express.urlencoded({extended:true}));

userRouter.get('/',(req,res)=>{
    res.render('index')
})

userRouter.get('/user_registration',(req,res)=>{
    res.render('page-login-register');
})
userRouter.post('/user_registration',async (req,res)=>{
    const {fname,lname,email,password,phoneNumber,otp} = req.body
    if(fname,lname,email,password,phoneNumber){
        await twilio.verify.v2
            .services(TWILIO_SERVICE_SID)
            .verifications.create({
                to:`+91${phoneNumber}`,
                channel:"sms"
            })
        await twilio.verify.v2
            .services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to:`+91${phoneNumber}`,
                code:otp
            })
    }else{
        res.redirect('/user_registration')
    }
    await customerModel.create({
        firstName:fname,
        lastName:lname,
        email:email,
        password:password[0],
        phoneNumber:phoneNumber,
        createdOn:new Date(),
    })
    res.redirect('/')
})

userRouter.get('/user_signin',(req,res)=>{
    res.redirect('user_registration')

})
userRouter.post('/user_signin',async(req,res)=>{
    const {email,password} = req.body;
    data = await customerModel.find({email:email})
    if(data.length>0){
        if(email===data[0].email&password===data[0].password){
            res.redirect('/product_lists')
        }else{
            res.redirect('/user_registration')
        }
    }else{
        res.redirect('/user_registration')
    }

})

userRouter.get('/product_lists',async(req,res)=>{
    try{
        products = await productModel.find({});
        categories = await categoryModel.find({})
        res.render('products-grid-view',{products,categories})
    }
    catch(err){
        console.error(err)
    }
})

module.exports = userRouter;