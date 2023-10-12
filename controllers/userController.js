const jwt = require("jsonwebtoken");
require("dotenv").config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const JWT_SECRET = process.env.JWT_SECRET;

const customerModel = require("../Model/customer");
const productsModel = require("../Model/product");
const categoryModel = require("../Model/category");
const brandsModel = require('../Model/brand')

let phoneNumber;
let isOtpVerified;
let isLogin = false;

module.exports.getSendOtp = async (req, res) => {
  try {
    phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports.getVerifyOtp = async (req, res) => {
  try {
    const otp = req.query.otp;
    const verifyOTP = await twilio.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      isOtpVerified = true;
    } else {
      isOtpVerified = false;
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getHome = async (req, res) => {
  try {
    let products = await productsModel.find({});
    let brands = await brandsModel.find({})
    res.render("home-page", { products , brands , isLogin});
  } catch (err) {
    console.error(err);
  }
};

module.exports.postUserRegister = async (req, res) => {
  try {
    const { fname, lname, email, SignupPassword, phoneNumber } = req.body;
    if (isOtpVerified) {
      await customerModel.create({
        firstName: fname,
        lastName: lname,
        email: email,
        password: SignupPassword,
        phoneNumber: phoneNumber,
        createdOn: new Date(),
      });
      res.render("page-login-register", {
        errorMsgSignup: "Account Created Successfully",
      });
    } else {
      res.render("page-login-register", { errorMsgOTP: "Invalid OTP" ,isLogin});
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getUserLoginRegister = (req, res) => {
  res.render("page-login-register",{isLogin});
};

module.exports.postUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    user = await customerModel.findOne({ email: email });
    if (user) {
      if (user.isBlocked) {
        res.render("page-login-register", {
          errorMsgLogin: "You Have Been Blocked by Admin",
        });
      } else {
        if (email === user.email && password === user.password) {
          const userToken = jwt.sign(user.email, JWT_SECRET);
          res.cookie("token", userToken, { maxAge: 24 * 60 * 60 * 1000 });
          isLogin = true;
          res.redirect("/products");
        } else {
          res.render("page-login-register", {
            errorMsgLogin: "Invalid Credentials",
          });
        }
      }
    } else {
      res.render("page-login-register", {
        errorMsgLogin: "No User Found on this Email Please Register",isLogin
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getProductsPage = async (req, res) => {
  try {
    products = await productsModel.find({});
    categories = await categoryModel.find({});
    brands = await brandsModel.find({})
    res.render("products-grid-view", { products, categories , brands ,isLogin});
  } catch (err) {
    console.error(err);
  }
};

module.exports.getProductPage = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await productsModel.findOne({ _id: id });
    const brand = await brandsModel.findOne({brandName:product.brand})
    res.render("shop-product-full", { product , brand, isLogin});
  } catch (err) {
    console.error(err);
  }
};

module.exports.getCartPage = async (req, res)=>{
  try{
    res.render('cart',{isLogin})
  } catch(err){
    console.error(err)
  }
}

module.exports.getContactPage = (req,res)=>{
  res.render('page-contact',{isLogin})
}

module.exports.getUserLogout = async(req,res)=>{
  try{
    res.clearCookie('token');
    isLogin = false
    res.redirect('/')
  } catch(err){
    console.error(err)
  }
}