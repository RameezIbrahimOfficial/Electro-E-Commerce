const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { customerModel, walletModel } = require('../../Model');

require('dotenv').config()

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});


// Send OTP While New User SignUp
const getSendOtp = async (req, res) => {
  try {
    phoneNumber = req.query.phoneNumber;
    await twilio.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+91${phoneNumber}`,
        channel: "sms",
      })
      .then(() => {
        res.status(200).json({ data: "Send" });
      });
  } catch (err) {
    console.error(err);
  }
};

// Verify the OTP that have been send and entered by user is Same
const getVerifyOtp = async (req, res) => {
  try {
    const phoneNumber = req.query.phoneNumber;
    const otp = req.query.otp;
    const verifyOTP = await twilio.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });
    if (verifyOTP.valid) {
      res.status(200).json({ data: "Verified" });
    } else {
      res.status(500).json({ data: "Incorrect OTP" });
    }
  } catch (err) {
    console.error(err);
  }
};

// POST Account Regsiter
const postUserRegister = async (req, res) => {
  try {
    const { fname, lname, email, SignupPassword, phoneNumber } = req.body;
    const isLogin = req.cookies.isLogin;
    bcrypt.hash(SignupPassword, 10, async (err, hash) => {
      await customerModel
        .create({
          firstName: fname,
          lastName: lname,
          email: email,
          password: hash,
          phoneNumber: phoneNumber,
          createdOn: new Date(),
        })
        .then(async (data) => {
          if (data) {
            const currUser = await customerModel.findOne({ email: email })
            await walletModel.create({
              userId: currUser._id,
              amount: 0
            })
            res.render("page-register", {
              errorMsgSignup: "Account Created Successfully",
              isLogin,
            });
          }
        });
    });
  } catch (err) {
    console.error(err);
  }
};

// Display User Registration Page
const getUserRegister = (req, res) => {
  const isLogin = req.cookies.isLogin;
  res.render("page-register", { isLogin });
};

module.exports = {
  getSendOtp,
  getVerifyOtp,
  postUserRegister,
  getUserRegister
}