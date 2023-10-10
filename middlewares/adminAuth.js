const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.currentRouter = (req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
};

module.exports.isLogin = (req, res, next) => {
  const token = req.cookies.token;
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/admin");
    }
    req.user = decoded;
    next();
  });
};
