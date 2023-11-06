const moment = require("moment");
const { productModel, brandModel, bannerModel } = require("../../Model");

// Display Home Page
const getHome = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    let products = await productModel.find({});
    let brands = await brandModel.find({});
    const banners = await bannerModel.find({ status: false });
    res.render("home-page", { products, brands, banners, moment, isLogin });
  } catch (err) {
    console.error(err);
  }
};

//  User Logout
const getUserLogout = async (req, res) => {
  try {
    res.clearCookie("userToken");
    res.clearCookie("isLogin");
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getHome, getUserLogout }