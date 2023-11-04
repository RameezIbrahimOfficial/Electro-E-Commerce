const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser')
const adminControllers = require('../controllers/adminControllers');

const { adminAuth, adminMiddleware } = require('../middlewares')

const adminRouter = express.Router();

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'Public/uploads')
    },
    filename : (req, file, cb) => {
        cb(null, file.originalname)
    }
})

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

adminRouter.get('/', adminControllers.getAdminLogin)
adminRouter.post('/admin_login', adminControllers.postAdminLogin)
adminRouter.get('/admin_panel', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getAdminPanel)
adminRouter.get('/admin_panel/products', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getProductsPage)
adminRouter.get('/admin_panel/add_products', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getAddProducts)
adminRouter.post('/admin_panel/add_products', upload.array('product_images'), adminAuth.isLogin, adminControllers.postAddProducts)
adminRouter.get('/edit_products', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getEditProducts)
adminRouter.post('/edit_products', upload.array('product_images'), adminAuth.isLogin, adminControllers.postEditProducts)
adminRouter.get('/block_products', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getBlockProducts)
adminRouter.get('/unblock_products', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getUnblockProducts)
adminRouter.get('/admin_panel/categories', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getCategoriesPage)
adminRouter.get('/admin_panel/edit_category', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getEditCategory)
adminRouter.post('/admin_panel/edit_category', adminAuth.isLogin, adminControllers.postEditCategory)
adminRouter.get('/admin_panel/block_category', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getBlockCategory)
adminRouter.get('/admin_panel/unblock_category', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getUnblockCategory)
adminRouter.post('/admin_panel/ceate_category', adminAuth.isLogin, adminControllers.postCreateCategory)
adminRouter.get('/admin_panel/user_management', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getUserManagement)
adminRouter.get('/admin_panel/brands', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getBrands)
adminRouter.post('/admin_panel/brand/add', upload.single('brandLogo'), adminAuth.isLogin, adminControllers.postAddBrands)
adminRouter.get('/admin_panel/brand/block', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getBlockBrand)
adminRouter.get('/admin_panel/brand/unblock', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getUnblockBrand)
adminRouter.get('/admin_panel/edit_brand', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getEditBrand)
adminRouter.post('/admin_panel/brand/update', upload.single('brandLogo'), adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.postEditBrand)
adminRouter.get('/logout', adminControllers.getLogout)
adminRouter.get('/order_management', adminAuth.isLogin, adminMiddleware.currentRouter , adminControllers.getOrderManagementPage)
adminRouter.get('/order/edit', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getOrderEditPage)
adminRouter.post('/order/edit', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.postOrderEdit)
adminRouter.get('/banner_management', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getBannerManagement)
adminRouter.post('/banner_management/add',upload.single('bannerImage'), adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.postAddBanner)
adminRouter.get('/banner/edit', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getEditBannerPage)
adminRouter.post('/banner/edit',upload.single('bannerImage'), adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.postUpdateBanner)
adminRouter.get('/banner/block', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getBlockBanner)
adminRouter.get('/banner/unblock', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getUnblockBanner)
adminRouter.get('/sales_report',adminAuth.isLogin,adminMiddleware.currentRouter, adminControllers.getSalesReportPage)
adminRouter.get('/sale',adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getMonthWeekYearSales)
adminRouter.get('/salesReport/excel', adminAuth.isLogin, adminControllers.salesReportExcel)
adminRouter.get('/salesReport/pdf', adminAuth.isLogin, adminControllers.salesReportPdf)

adminRouter.get('/coupon', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getCouponManagementPage)
adminRouter.post('/coupon/add', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.postAddCoupon)   
adminRouter.get('/coupon/block', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getBlockCoupon)
adminRouter.get('/coupon/unblock', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getUnBlockCoupon)
adminRouter.get('/coupon/edit', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.getEditCouponPage)
adminRouter.post('/coupon/edit', adminAuth.isLogin, adminMiddleware.currentRouter, adminControllers.postEditCoupon)

// adminRouter.use(adminMiddleware.errorHandlingMiddleware)

module.exports = adminRouter