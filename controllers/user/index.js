const {getWalletPage,getPlaceOrderWallet} = require('../user/wallet');
const {postRedeemCoupon} = require('../user/coupon')
const {getPlaceOrderCOD,getPlaceOrderOnline,postUpdatePaymentStatus,getInvoice,getOrderCancel,getOrderReturn} = require('../user/order')
const {getCheckoutPage} = require('../user/checkout')
const {getDeleteWishlist, getWishlistPage, postAddToWishlist } = require('../user/wishlist')
const {getProductPage, getProductsPage} = require('../user/product')
const {getContactPage} = require('../user/contact')
const {getSearch,postSearch} = require('../user/search')
const {getCartPage,postAddToCart,getDeleteCart,postCartUpdate} = require('../user/cart')
const {getUserLogin,postUserLogin} = require('../user/login')
const {getSendOtp,getVerifyOtp,postUserRegister,getUserRegister} = require('../user/signup')
const {getProfile,getAddAddressPage,postAddAddress,getAddressDelete,postAddressEdit,getAddressEdit, postUpdateUserDetails,getchangePasswordPage,postNewPassword,getPasswordResetPage,getSendOtpPasswordReset, getVerifyOtpPasswordReset} = require('../user/profile')
const {getHome, getUserLogout} = require('../user/user')

module.exports = {
    getWalletPage,
    getPlaceOrderWallet,
    postRedeemCoupon,
    getPlaceOrderCOD,
    getPlaceOrderOnline,
    postUpdatePaymentStatus,
    getInvoice,
    getOrderCancel,
    getOrderReturn,
    getCheckoutPage,
    getWishlistPage,
    postAddToWishlist,
    getDeleteWishlist,
    getProductPage,
    getProductsPage,
    getContactPage,
    getSearch,
    postSearch,
    getCartPage,
    postAddToCart,
    getDeleteCart,
    postCartUpdate,
    getUserLogin,
    postUserLogin,
    getSendOtp,
    getVerifyOtp,
    postUserRegister,
    getUserRegister,
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
    getVerifyOtpPasswordReset,
    getHome, 
    getUserLogout
}