const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { customerModel } = require("../../Model");
const {JWT_SECRET} = process.env

// Display User Login Page
const getUserLogin = (req, res) => {
    const isLogin = req.cookies.isLogin;
    if (isLogin) {
      res.redirect("/");
    } else {
      res.render("page-login", { isLogin });
    }
  };
  
  // POST User Login ( Authenticate user )
  const postUserLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      user = await customerModel.findOne({ email: email });
      const isLogin = req.cookies.isLogin;
      if (user) {
        if (user.isBlocked) {
          res.render("page-login", {
            errorMsgLogin: "You Have Been Blocked by Admin",
            isLogin,
          });
        } else {
          bcrypt.compare(password, user.password,async (err, result) => {
            if (email === user.email && result == true) {
              const token = jwt.sign(user.email, JWT_SECRET);
              res.cookie("userToken", token, { maxAge: 24 * 60 * 60 * 1000 });
              res.cookie("isLogin", true, { maxAge: 24 * 60 * 60 * 1000 });
              res.redirect("/products");
            } else {
              res.render("page-login", {
                errorMsgLogin: "Invalid Credentials",
                isLogin,
              });
            }
          });
        }
      } else {
        res.render("page-login", {
          errorMsgLogin: "No User Found on this Email Please Register",
          isLogin,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

module.exports = {
    getUserLogin,
    postUserLogin
}