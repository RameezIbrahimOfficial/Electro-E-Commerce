const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.isUserLogin = (req, res, next) => {
    const token = req.cookies.token;
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.redirect("/register");
      } else {
        req.user = decoded;
      }

      next();
    });
  };