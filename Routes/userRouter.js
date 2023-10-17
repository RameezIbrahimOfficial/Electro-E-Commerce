const express = require("express");

const userRouter = express.Router();

const userController = require('../controllers/userController')
const userAuth = require('../middlewares/userAuth');
const cookieParser = require("cookie-parser");

userRouter.use(express.static("Public"));
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));
userRouter.use(cookieParser())

userRouter.get("/send_otp", userController.getSendOtp);
userRouter.get("/verify_otp", userController.getVerifyOtp);
userRouter.get("/", userController.getHome);
userRouter.get("/register", userController.getUserRegister);
userRouter.post("/register", userController.postUserRegister);
userRouter.get('/signin', userController.getUserLogin)
userRouter.post("/signin", userController.postUserLogin);
userRouter.get("/products", userController.getProductsPage);
userRouter.get('/product', userController.getProductPage)
userRouter.get('/contact', userController.getContactPage)
userRouter.get('/search', userController.getSearch)
userRouter.post('/search', userController.postSearch)
userRouter.get('/cart', userAuth.isUserLogin, userController.getCartPage)
userRouter.post('/cart', userAuth.isUserLogin, userController.postAddToCart)
userRouter.get('/cart/delete', userAuth.isUserLogin, userController.getDeleteCart)
userRouter.post('/cart/update', userAuth.isUserLogin, userController.postCartUpdate)
userRouter.get('/profile',userAuth.isUserLogin, userController.getPorfile)
userRouter.get('/logout', userController.getUserLogout)

module.exports = userRouter;
