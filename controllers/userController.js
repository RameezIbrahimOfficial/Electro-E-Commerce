require("dotenv").config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const customerModel = require("../Model/customerSchema");
const productsModel = require("../Model/productSchema");
const categoryModel = require("../Model/categorySchema");

let phoneNumber;
let isOtpVerified;

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
    res.render("home-page", { products });
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
      res.redirect("page-login-register", { errorMsgOTP: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getUserLoginRegister = (req, res) => {
  res.render("page-login-register");
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
};

module.exports.getProductsPage = async (req, res) => {
  try {
    products = await productsModel.find({});
    categories = await categoryModel.find({});
    res.render("products-grid-view", { products, categories });
  } catch (err) {
    console.error(err);
  }
};

module.exports.getProductPage = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await productsModel.findOne({ _id: id });
    res.render("shop-product-full", { product });
  } catch (err) {
    console.error(err);
  }
};
