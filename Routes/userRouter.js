const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = express.Router();
const { userMiddlewares, userAuth } = require('../middlewares');
const { getPlaceOrderWallet, getWalletPage, postRedeemCoupon, getPlaceOrderCOD, getPlaceOrderOnline, postUpdatePaymentStatus, getInvoice, getOrderCancel, getOrderReturn, getCheckoutPage, getWishlistPage, postAddToWishlist, getDeleteWishlist, getProductPage, getProductsPage, getContactPage, getSearch, postSearch, getCartPage, postAddToCart, getDeleteCart, postCartUpdate, getUserLogin, postUserLogin, getSendOtp, getVerifyOtp, postUserRegister, getUserRegister, getProfile, getAddAddressPage, postAddAddress, getAddressDelete, postAddressEdit, getAddressEdit, postUpdateUserDetails, getchangePasswordPage, postNewPassword, getPasswordResetPage, getSendOtpPasswordReset, getVerifyOtpPasswordReset, getHome, getUserLogout } = require('../controllers/user')

userRouter.use(express.static("Public"));
userRouter.use('/address', express.static('Public'));
userRouter.use(express.json());
userRouter.use(express.urlencoded({ extended: true }));
userRouter.use(cookieParser())

// User 
userRouter.get("/send_otp", getSendOtp);
userRouter.get("/verify_otp", getVerifyOtp);
userRouter.get("/", getHome);
userRouter.get("/register", getUserRegister);
userRouter.post("/register", postUserRegister);
userRouter.get('/signin', getUserLogin)
userRouter.post("/signin", postUserLogin);
userRouter.get('/forgetPassword', getPasswordResetPage)
userRouter.get('/forgetPassword/sendOtp', getSendOtpPasswordReset)
userRouter.get('/forgetPassword/verifyOtp', getVerifyOtpPasswordReset)
userRouter.get('/changePassword', getchangePasswordPage);
userRouter.get('/logout', getUserLogout)
userRouter.get('/profile', userAuth.isUserLogin, userAuth.isUserBloked, getProfile)
userRouter.get('/address/add', userAuth.isUserLogin, userAuth.isUserBloked, getAddAddressPage)
userRouter.post('/address/add', userAuth.isUserLogin, userAuth.isUserBloked, postAddAddress)
userRouter.get('/address/delete', userAuth.isUserLogin, userAuth.isUserBloked, getAddressDelete)
userRouter.get('/address/edit', userAuth.isUserLogin, userAuth.isUserBloked, getAddressEdit)
userRouter.post('/address/edit', userAuth.isUserLogin, userAuth.isUserBloked, postAddressEdit)
userRouter.post('/changePassword', postNewPassword)
userRouter.post('/profile/update', userAuth.isUserLogin, userAuth.isUserBloked, postUpdateUserDetails)

// Products
userRouter.get("/products", getProductsPage);
userRouter.get('/product', getProductPage)

// Contact
userRouter.get('/contact', getContactPage)

// Search
userRouter.get('/search', getSearch)
userRouter.post('/search', postSearch)

// Cart
userRouter.get('/cart', userAuth.isUserLogin, userAuth.isUserBloked, getCartPage)
userRouter.post('/cart', userAuth.isUserLogin, userAuth.isUserBloked, postAddToCart)
userRouter.get('/cart/delete', userAuth.isUserLogin, userAuth.isUserBloked, getDeleteCart)
userRouter.post('/cart/update', userAuth.isUserLogin, userAuth.isUserBloked, postCartUpdate)

// Wishlist
userRouter.get('/wishlist', userAuth.isUserLogin, userAuth.isUserBloked, getWishlistPage)
userRouter.post('/wishlist', userAuth.isUserLogin, userAuth.isUserBloked, postAddToWishlist)
userRouter.get('/wishlist/delete', userAuth.isUserLogin, userAuth.isUserBloked, getDeleteWishlist)

// Checkout
userRouter.get('/checkout', userAuth.isUserLogin, userAuth.isUserBloked, getCheckoutPage)

// Order
userRouter.get('/placeorder/cod', userAuth.isUserLogin, userAuth.isUserBloked, getPlaceOrderCOD)
userRouter.get('/invoice', userAuth.isUserLogin, userAuth.isUserBloked, getInvoice)
userRouter.get('/order/cancel', userAuth.isUserLogin, userAuth.isUserBloked, getOrderCancel)
userRouter.get('/order/return', userAuth.isUserLogin, userAuth.isUserBloked, getOrderReturn)
userRouter.get('/placeorder/online', userAuth.isUserLogin, userAuth.isUserBloked, getPlaceOrderOnline)
userRouter.post('/updatePaymentStatus', userAuth.isUserLogin, userAuth.isUserBloked, postUpdatePaymentStatus)
userRouter.get('/placeorder/wallet', userAuth.isUserLogin, userAuth.isUserBloked, getPlaceOrderWallet)

// Coupon
userRouter.post('/coupon/redeem', userAuth.isUserLogin, userAuth.isUserBloked, postRedeemCoupon)

// Wallet
userRouter.get('/wallet', userAuth.isUserLogin, userAuth.isUserBloked, getWalletPage)

// userRouter.use(userMiddlewares.errorHandlingMiddleware)

module.exports = userRouter;
