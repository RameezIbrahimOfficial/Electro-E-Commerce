const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const customerModel = require("../Model/customerSchema");
const productsModel = require("../Model/productSchema");
const categoryModel = require("../Model/categorySchema");

const userRouter = express.Router();

userRouter.use(express.static("public"));
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));

let phoneNumber;
let isOtpVerified;

userRouter.get("/send_otp", async (req, res) => {
  try {
    phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });
  } catch (err) {
    console.error(err);
  }
});

userRouter.get("/verify_otp", async (req, res) => {
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
});

userRouter.get("/", async(req, res) => {
  try{
    let products = await productsModel.find({})
    res.render("home-page",{products});
  }
  catch(err){
    console.error(err)
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    const { fname, lname, email, password, phoneNumber, Confirmpassword, otp } =
      req.body;
    if (
      !fname ||
      !lname ||
      !email ||
      !password ||
      !Confirmpassword ||
      !phoneNumber
    ) {
      res.render("page-login-register", { errorMsgSignup: "Enter All fields" });
    } else {
      if (password === Confirmpassword) {
        if (isOtpVerified) {
          await customerModel.create({
            firstName: fname,
            lastName: lname,
            email: email,
            password: password[0],
            phoneNumber: phoneNumber,
            createdOn: new Date(),
          });
          res.render("page-login-register", {
            errorMsgSignup: "Account Created Successfully",
          });
        } else {
          res.redirect("page-login-register", { errorMsgOTP: "Invalid OTP" });
        }
      } else {
        res.render("page-login-register", {
          errorMsgPassword: "Password and Cofirm Password Must be same",
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
});

userRouter.get("/register", (req, res) => {
  res.render("page-login-register");
});
userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    data = await customerModel.findOne({ email: email });
    if (data) {
      if(data.isBlocked){
        res.render("page-login-register", {
            errorMsgLogin: "You Have Been Blocked by Admin"})
      }else{
        if ((email === data[0].email) & (password === data[0].password)) {
            res.redirect("/products");
          } else {
            res.render("page-login-register", {
              errorMsgLogin: "Invalid Credentials",
            });
          }
      }
    } else {
      res.render("page-login-register", {
        errorMsgLogin: "No User Found on this Email Please Register",
      });
    }
  } catch (err) {
    console.error(err);
  }
});

userRouter.get("/products", async (req, res) => {
  try {
    products = await productsModel.find({});
    categories = await categoryModel.find({});
    res.render("products-grid-view", { products, categories });
  } catch (err) {
    console.error(err);
  }
});

userRouter.get('/product',async(req,res)=>{
  try{
    const id = req.query.id;
    const product = await productsModel.findOne({_id:id})
    res.render('shop-product-full',{product})
  }
  catch(err){
    console.error(err)
  }
})

module.exports = userRouter;
