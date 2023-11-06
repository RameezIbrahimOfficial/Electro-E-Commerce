const express = require("express");

const userRouter = express.Router();

const userController = require('../controllers/userController')
const cookieParser = require("cookie-parser");

const {userMiddlewares, userAuth} = require('../middlewares');

userRouter.use(express.static("Public"));
userRouter.use('/address', express.static('Public'));
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
userRouter.get('/cart', userAuth.isUserLogin,userAuth.isUserBloked, userController.getCartPage)
userRouter.post('/cart', userAuth.isUserLogin,userAuth.isUserBloked, userController.postAddToCart)
userRouter.get('/cart/delete', userAuth.isUserLogin,userAuth.isUserBloked, userController.getDeleteCart)
userRouter.post('/cart/update', userAuth.isUserLogin,userAuth.isUserBloked, userController.postCartUpdate)
userRouter.get('/profile',userAuth.isUserLogin,userAuth.isUserBloked, userController.getProfile)
userRouter.get('/logout', userController.getUserLogout)
userRouter.get('/address/add', userAuth.isUserLogin,userAuth.isUserBloked, userController.getAddAddressPage)
userRouter.post('/address/add', userAuth.isUserLogin,userAuth.isUserBloked, userController.postAddAddress)
userRouter.get('/address/delete',userAuth.isUserLogin,userAuth.isUserBloked, userController.getAddressDelete)
userRouter.get('/address/edit',userAuth.isUserLogin,userAuth.isUserBloked, userController.getAddressEdit)
userRouter.post('/address/edit',userAuth.isUserLogin,userAuth.isUserBloked, userController.postAddressEdit)
userRouter.get('/wishlist',userAuth.isUserLogin,userAuth.isUserBloked, userController.getWishlistPage)
userRouter.post('/wishlist',userAuth.isUserLogin,userAuth.isUserBloked, userController.postAddToWishlist)
userRouter.get('/wishlist/delete',userAuth.isUserLogin,userAuth.isUserBloked, userController.getDeleteWishlist)
userRouter.get('/checkout', userAuth.isUserLogin,userAuth.isUserBloked, userController.getCheckoutPage)
userRouter.get('/placeorder/cod', userAuth.isUserLogin,userAuth.isUserBloked, userController.getPlaceOrderCOD)
userRouter.get('/invoice',userAuth.isUserLogin,userAuth.isUserBloked, userController.getInvoice)
userRouter.get('/order/cancel', userAuth.isUserLogin,userAuth.isUserBloked, userController.getOrderCancel)
userRouter.get('/order/return', userAuth.isUserLogin,userAuth.isUserBloked, userController.getOrderReturn)
userRouter.get('/placeorder/online', userAuth.isUserLogin,userAuth.isUserBloked, userController.getPlaceOrderOnline)
userRouter.post('/updatePaymentStatus', userAuth.isUserLogin,userAuth.isUserBloked, userController.postUpdatePaymentStatus)
userRouter.get('/forgetPassword', userController.getPasswordResetPage)
userRouter.get('/forgetPassword/sendOtp', userController.getSendOtpPasswordReset)
userRouter.get('/forgetPassword/verifyOtp', userController.getVerifyOtpPasswordReset)
userRouter.get('/changePassword', userController.getchangePasswordPage);
userRouter.post('/changePassword', userController.postNewPassword)
userRouter.post('/profile/update', userAuth.isUserLogin, userAuth.isUserBloked, userController.postUpdateUserDetails)
userRouter.post('/coupon/redeem', userAuth.isUserLogin, userAuth.isUserBloked, userController.postRedeemCoupon)
userRouter.get('/wallet', userAuth.isUserLogin, userAuth.isUserBloked, userController.getWalletPage)


userRouter.get('/placeorder/wallet', userAuth.isUserLogin,userAuth.isUserBloked, userController.getPlaceOrderWallet)

// userRouter.use(userMiddlewares.errorHandlingMiddleware)

module.exports = userRouter;
