const moment = require('moment')
const bcrypt = require('bcrypt')

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const { customerModel, addressModel, couponModel, orderModel } = require('../../Model')

// Display user Profile Page
const getProfile = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const userEmail = req.user;
    const user = await customerModel.findOne({ email: userEmail });
    const userAddress = await addressModel.findOne({ userId: user._id });
    const coupons = await couponModel.find({});
    const orders = await orderModel.aggregate([
      { $match: { customerId: user._id } },
      { $sort: { createdOn: -1 } },
    ]);
    const { firstName, lastName } = await customerModel.findOne(
      { email: userEmail },
      { firstName: 1, lastName: 1 }
    );
    res.render("page-account", {
      userName: firstName + " " + lastName,
      userAddress,
      isLogin,
      orders,
      moment,
      user,
      coupons,
    });
  } catch (error) {
    console.error(error);
  }
};

// Display Add address Page
const getAddAddressPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    res.render("page-address", { isLogin });
  } catch (error) {
    console.error(error);
  }
};

// Add User Address to DB
const postAddAddress = async (req, res) => {
  try {
    const user = await customerModel.findOne({ email: req.user }, { _id: 1 });
    const {
      addressType,
      name,
      city,
      landMark,
      state,
      pincode,
      phone,
      altPhone,
    } = req.body;
    const userAddress = await addressModel.findOne({ userId: user._id });
    if (!userAddress) {
      const newAddress = new addressModel({
        userId: user._id,
        address: [
          {
            addressType,
            name,
            city,
            landMark,
            state,
            pincode,
            phone,
            altPhone,
          },
        ],
      });
      await newAddress.save();
    } else {
      userAddress.address.push({
        addressType,
        name,
        city,
        landMark,
        state,
        pincode,
        phone,
        altPhone,
      });
    }
    await userAddress.save();
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
  }
};

// Delete User Address
const getAddressDelete = async (req, res) => {
  try {
    addressId = req.query.id;
    const user = await customerModel.findOne({ email: req.user }, { _id: 1 });
    const currAddress = await addressModel.findOne({
      "address._id": addressId,
    });
    if (currAddress) {
      await addressModel.updateOne(
        { userId: user._id },
        {
          $pull: { address: { _id: addressId } },
        }
      );
    }
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
  }
};

// Display user Address Edit Page
const getAddressEdit = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const addressId = req.query.id;
    const currAddress = await addressModel.findOne({
      "address._id": addressId,
    });

    if (currAddress && currAddress.address) {
      const matchingAddress = currAddress.address.find(
        (item) => item._id == addressId
      );
      res.render("page-edit-address", { isLogin, matchingAddress });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.error(error);
  }
};

// Update DB with updated Address Details
const postAddressEdit = async (req, res) => {
  try {
    const {
      addressType,
      name,
      city,
      landMark,
      state,
      pincode,
      phone,
      altPhone,
    } = req.body;
    const addressId = req.query.id;
    const currAddress = await addressModel.findOne({
      "address._id": addressId,
    });

    if (currAddress && currAddress.address) {
      const matchingAddress = currAddress.address.find(
        (item) => item._id == addressId
      );

      if (matchingAddress) {
        await addressModel
          .updateOne(
            { "address._id": addressId },
            {
              $set: {
                "address.$": {
                  addressType,
                  name,
                  city,
                  landMark,
                  state,
                  pincode,
                  phone,
                  altPhone,
                },
              },
            }
          )
          .then(() => {
            res.redirect("/profile");
          });
      }
      res.redirect("/profile");
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.error(error);
  }
};

//Update User Details Into DB
const postUpdateUserDetails = async (req, res) => {
  try {
    const { firstName, lastName, email, password, newPassword } = req.body;
    const user = await customerModel.findOne({ email: req.user });
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const salt = await bcrypt.hash(newPassword, 10);

      await customerModel.updateOne(
        { email: email },
        {
          $set: {
            firstName,
            lastName,
            email,
            password: salt,
          },
        }
      );

      res.status(200).json({ data: "Data Updated" });
    } else {
      res.status(500).json({ data: "Current Password Incorrect" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ data: "An error occurred" });
  }
};

// Display New Password Page
const getchangePasswordPage = async (req, res) => {
  try {
    const userEmail = req.query.email;
    const isLogin = req.cookies.isLogin;

    res.render("change-password", { isLogin, userEmail });
  } catch (error) {
    console.error(error);
  }
};

// Update DB with new New Password
const postNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    bcrypt.hash(password, 10, async (err, hash) => {
      await customerModel.updateOne(
        { email: email },
        {
          $set: {
            password: hash,
          },
        }
      );
    });
    res.status(200).json({ Data: "Password Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Data: "Password Updation Failed" });
  }
};

// Display Forget Password Page
const getPasswordResetPage = (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    res.render("forget-password", { isLogin });
  } catch (error) {
    console.error(error);
  }
};

// Send Password Reset OTP
const getSendOtpPasswordReset = async (req, res) => {
  try {
    const userEmail = req.query.email;
    const user = await customerModel.findOne({ email: userEmail });
    if (user) {
      await twilio.verify.v2
        .services(TWILIO_SERVICE_SID)
        .verifications.create({
          to: `+91${user.phoneNumber}`,
          channel: "sms",
        })
        .then(() => {
          res.status(200).json({ data: "Send" });
        });
    } else {
      res.status(500).json({ data: "No user with this email" });
    }
  } catch (err) {
    console.error(err);
  }
};

// Verify Password Reset OTP
const getVerifyOtpPasswordReset = async (req, res) => {
  try {
    const otp = req.query.otp;
    const email = req.query.email;
    const user = await customerModel.findOne({ email: email });
    const verifyOTP = await twilio.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${user.phoneNumber}`,
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

module.exports = {
  getProfile,
  getAddAddressPage,
  postAddAddress,
  getAddressDelete,
  postAddressEdit,
  getAddressEdit,
  postUpdateUserDetails,
  getchangePasswordPage,
  postNewPassword,
  getPasswordResetPage,
  getSendOtpPasswordReset,
  getVerifyOtpPasswordReset
}