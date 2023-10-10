const express = require("express");

const userRouter = express.Router();

const userController = require('../controllers/userController')

userRouter.use(express.static("public"));
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));

userRouter.get("/send_otp", userController.getSendOtp);
userRouter.get("/verify_otp", userController.getVerifyOtp);
userRouter.get("/", userController.getHome);
userRouter.get("/register", userController.getUserLoginRegister);
userRouter.post("/register", userController.postUserRegister);
userRouter.post("/signin", userController.postUserLogin);
userRouter.get("/products", userController.getProductsPage);
userRouter.get('/product', userController.getProductPage)

module.exports = userRouter;
