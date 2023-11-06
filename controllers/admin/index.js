const { getUserManagement, getUserBlock, getUserUnblock } = require('../admin/user');
const { getMonthWeekYearSales, salesReportExcel, salesReportPdf, getSalesReportPage } = require('../admin/sales');
const { getProductsPage, getAddProducts, getEditProducts, postAddProducts, postEditProducts, getBlockProducts, getUnblockProducts } = require('../admin/product')
const { getOrderEditPage, getOrderManagementPage, postOrderEdit } = require('../admin/order')
const { getCouponManagementPage, postAddCoupon, getBlockCoupon, getUnBlockCoupon, getEditCouponPage, postEditCoupon } = require('../admin/coupon')
const { getCategoriesPage, getEditCategory, postEditCategory, getBlockCategory, getUnblockCategory, postCreateCategory } = require('../admin/category')
const { getBrands, postAddBrands, getBlockBrand, getUnblockBrand, getEditBrand, postEditBrand } = require('../admin/brand')
const { getBannerManagement, postAddBanner, getEditBannerPage, postUpdateBanner, getBlockBanner, getUnblockBanner } = require('../admin/banner')
const { getAdminLogin, postAdminLogin, getAdminPanel, getLogout } = require('../admin/admin');

module.exports = {
    getUserManagement,
    getUserBlock,
    getUserUnblock,
    getMonthWeekYearSales,
    salesReportExcel,
    salesReportPdf,
    getSalesReportPage,
    getProductsPage,
    getAddProducts,
    getEditProducts,
    postAddProducts,
    postEditProducts,
    getBlockProducts,
    getUnblockProducts,
    getOrderManagementPage,
    getOrderEditPage,
    postOrderEdit,
    getCouponManagementPage,
    postAddCoupon,
    getBlockCoupon,
    getUnBlockCoupon,
    getEditCouponPage,
    postEditCoupon,
    getCategoriesPage,
    getEditCategory,
    postEditCategory,
    getBlockCategory,
    getUnblockCategory,
    postCreateCategory,
    getBrands,
    postAddBrands,
    getBlockBrand,
    getUnblockBrand,
    getEditBrand,
    postEditBrand,
    getBannerManagement,
    postAddBanner,
    getEditBannerPage,
    postUpdateBanner,
    getBlockBanner,
    getUnblockBanner,
    getAdminLogin,
    postAdminLogin,
    getAdminPanel,
    getLogout
}