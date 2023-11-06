const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser')

const { adminAuth, adminMiddleware } = require('../middlewares');

const {getUserManagement, getUserBlock, getUserUnblock,getMonthWeekYearSales, salesReportExcel, salesReportPdf, getSalesReportPage,getProductsPage, getAddProducts, getEditProducts, postAddProducts, postEditProducts, getBlockProducts, getUnblockProducts, getOrderManagementPage, getOrderEditPage, postOrderEdit, getCouponManagementPage,postAddCoupon,getBlockCoupon,getUnBlockCoupon,getEditCouponPage,postEditCoupon, getCategoriesPage,getEditCategory,postEditCategory,getBlockCategory,getUnblockCategory,postCreateCategory,getBrands,postAddBrands,getBlockBrand,getUnblockBrand,getEditBrand,postEditBrand,   getBannerManagement,postAddBanner,getEditBannerPage,postUpdateBanner,getBlockBanner,getUnblockBanner,getAdminLogin,postAdminLogin,getAdminPanel,getLogout} = require('../controllers/admin');


const adminRouter = express.Router();

const {filterOrdersForYear,filterOrdersForMonth,filterOrdersForWeek,getWeekNumber,storage} = require('../helpers')

const upload = multer({storage : storage})

adminRouter.use('/uploads', express.static('uploads'));
adminRouter.use(express.static('Public'))
adminRouter.use('/admin_panel', express.static('Public'));
adminRouter.use('/order', express.static('Public'));
adminRouter.use('/banner', express.static('Public'));
adminRouter.use('/coupon', express.static('Public'));
adminRouter.use(express.json());
adminRouter.use(express.urlencoded({ extended: true }));
adminRouter.use(cookieParser())

// Home
adminRouter.get('/', getAdminLogin)
adminRouter.post('/admin_login', postAdminLogin)
adminRouter.get('/admin_panel', adminAuth.isLogin, adminMiddleware.currentRouter, getAdminPanel)
adminRouter.get('/logout',adminAuth.isLogin, getLogout)

// Product Management
adminRouter.get('/admin_panel/products', adminAuth.isLogin, adminMiddleware.currentRouter, getProductsPage)
adminRouter.get('/admin_panel/add_products', adminAuth.isLogin, adminMiddleware.currentRouter, getAddProducts)
adminRouter.post('/admin_panel/add_products', upload.array('product_images'), adminAuth.isLogin, postAddProducts)
adminRouter.get('/edit_products', adminAuth.isLogin, adminMiddleware.currentRouter, getEditProducts)
adminRouter.post('/edit_products', upload.array('product_images'), adminAuth.isLogin, postEditProducts)
adminRouter.get('/block_products', adminAuth.isLogin, adminMiddleware.currentRouter, getBlockProducts)
adminRouter.get('/unblock_products', adminAuth.isLogin, adminMiddleware.currentRouter, getUnblockProducts)

// Category Management
adminRouter.get('/admin_panel/categories', adminAuth.isLogin, adminMiddleware.currentRouter, getCategoriesPage)
adminRouter.get('/admin_panel/edit_category', adminAuth.isLogin, adminMiddleware.currentRouter, getEditCategory)
adminRouter.post('/admin_panel/edit_category', adminAuth.isLogin, postEditCategory)
adminRouter.get('/admin_panel/block_category', adminAuth.isLogin, adminMiddleware.currentRouter, getBlockCategory)
adminRouter.get('/admin_panel/unblock_category', adminAuth.isLogin, adminMiddleware.currentRouter, getUnblockCategory)
adminRouter.post('/admin_panel/ceate_category', adminAuth.isLogin, postCreateCategory)

// User Management
adminRouter.get('/admin_panel/user_management', adminAuth.isLogin, adminMiddleware.currentRouter, getUserManagement)
adminRouter.get('/admin_panel/user/block', adminAuth.isLogin, adminMiddleware.currentRouter, getUserBlock)
adminRouter.get('/admin_panel/user/unblock', adminAuth.isLogin, adminMiddleware.currentRouter, getUserUnblock)

// Brand Management
adminRouter.get('/admin_panel/brands', adminAuth.isLogin, adminMiddleware.currentRouter, getBrands)
adminRouter.post('/admin_panel/brand/add', upload.single('brandLogo'), adminAuth.isLogin, postAddBrands)
adminRouter.get('/admin_panel/brand/block', adminAuth.isLogin, adminMiddleware.currentRouter, getBlockBrand)
adminRouter.get('/admin_panel/brand/unblock', adminAuth.isLogin, adminMiddleware.currentRouter, getUnblockBrand)
adminRouter.get('/admin_panel/edit_brand', adminAuth.isLogin, adminMiddleware.currentRouter, getEditBrand)
adminRouter.post('/admin_panel/brand/update', upload.single('brandLogo'), adminAuth.isLogin, adminMiddleware.currentRouter, postEditBrand)

// Order Mangement 
adminRouter.get('/order_management', adminAuth.isLogin, adminMiddleware.currentRouter , getOrderManagementPage)
adminRouter.get('/order/edit', adminAuth.isLogin, adminMiddleware.currentRouter, getOrderEditPage)
adminRouter.post('/order/edit', adminAuth.isLogin, adminMiddleware.currentRouter, postOrderEdit)

// Banner Mangement
adminRouter.get('/banner_management', adminAuth.isLogin, adminMiddleware.currentRouter, getBannerManagement)
adminRouter.post('/banner_management/add',upload.single('bannerImage'), adminAuth.isLogin, adminMiddleware.currentRouter, postAddBanner)
adminRouter.get('/banner/edit', adminAuth.isLogin, adminMiddleware.currentRouter, getEditBannerPage)
adminRouter.post('/banner/edit',upload.single('bannerImage'), adminAuth.isLogin, adminMiddleware.currentRouter, postUpdateBanner)
adminRouter.get('/banner/block', adminAuth.isLogin, adminMiddleware.currentRouter, getBlockBanner)
adminRouter.get('/banner/unblock', adminAuth.isLogin, adminMiddleware.currentRouter, getUnblockBanner)

// Sales Management
adminRouter.get('/sales_report',adminAuth.isLogin,adminMiddleware.currentRouter, getSalesReportPage)
adminRouter.get('/sale',adminAuth.isLogin, adminMiddleware.currentRouter, getMonthWeekYearSales)
adminRouter.get('/salesReport/excel', adminAuth.isLogin, salesReportExcel)
adminRouter.get('/salesReport/pdf', adminAuth.isLogin, salesReportPdf)

// Coupon Management 
adminRouter.get('/coupon', adminAuth.isLogin, adminMiddleware.currentRouter, getCouponManagementPage)
adminRouter.post('/coupon/add', adminAuth.isLogin, adminMiddleware.currentRouter, postAddCoupon)   
adminRouter.get('/coupon/block', adminAuth.isLogin, adminMiddleware.currentRouter, getBlockCoupon)
adminRouter.get('/coupon/unblock', adminAuth.isLogin, adminMiddleware.currentRouter, getUnBlockCoupon)
adminRouter.get('/coupon/edit', adminAuth.isLogin, adminMiddleware.currentRouter, getEditCouponPage)
adminRouter.post('/coupon/edit', adminAuth.isLogin, adminMiddleware.currentRouter, postEditCoupon)

// adminRouter.use(adminMiddleware.errorHandlingMiddleware)

module.exports = adminRouter