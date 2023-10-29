const jwt = require("jsonwebtoken");
require("dotenv").config();

const customer = require('../Model/customer')

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.isUserLogin = (req, res, next) => {
  const token = req.cookies.userToken;
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/signin");
    }
    req.user = decoded;
    next();
  });
};

module.exports.isUserBloked = async (req, res, next) => {
  user = req.user;
  const currUser = await customer.findOne({ email: user })
  if (currUser.isBlocked) {
    res.clearCookie("userToken");
    res.clearCookie("isLogin");
    return res.redirect('/signin')
  }
  next()
}