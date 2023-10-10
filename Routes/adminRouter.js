const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser')
const adminControllers = require('../controllers/adminControllers');
const middlewares = require('../middlewares/middlewares')

const storage = multer.memoryStorage();
const upload = multer({storage:storage})

const adminRouter = express.Router();

adminRouter.use(express.static('Public'))
adminRouter.use('/admin_panel', express.static('Public'));
adminRouter.use(express.json());
adminRouter.use(express.urlencoded({extended:true}));
adminRouter.use(cookieParser())

adminRouter.get('/',adminControllers.getAdminLogin)
adminRouter.post('/admin_login',adminControllers.postAdminLogin)
adminRouter.get('/admin_panel',middlewares.isLogin,adminControllers.getAdminPanel)
adminRouter.get('/admin_panel/products',middlewares.isLogin,adminControllers.getProductsPage)
adminRouter.get('/admin_panel/add_products',middlewares.isLogin,adminControllers.getAddProducts)
adminRouter.post('/admin_panel/add_products',upload.array('product_images'),middlewares.isLogin,adminControllers.postAddProducts)
adminRouter.get('/edit_products',middlewares.isLogin,adminControllers.getEditProducts)
adminRouter.post('/edit_products',upload.array('product_images'),middlewares.isLogin,adminControllers.postEditProducts)
adminRouter.get('/block_products',middlewares.isLogin,adminControllers.getBlockProducts)
adminRouter.get('/unblock_products',middlewares.isLogin,adminControllers.getUnblockProducts)
adminRouter.get('/admin_panel/categories',middlewares.isLogin,adminControllers.getCategoriesPage)
adminRouter.get('/admin_panel/edit_category',middlewares.isLogin,adminControllers.getEditCategory)
adminRouter.post('/admin_panel/edit_category',middlewares.isLogin,adminControllers.postEditCategory)
adminRouter.get('/admin_panel/block_category',middlewares.isLogin,adminControllers.getBlockCategory)
adminRouter.get('/admin_panel/unblock_category',middlewares.isLogin,adminControllers.getUnblockCategory)
adminRouter.post('/admin_panel/ceate_category',middlewares.isLogin,adminControllers.postCreateCategory)
adminRouter.get('/admin_panel/user_management',middlewares.isLogin,adminControllers.getUserManagement)
adminRouter.get('/logout',adminControllers.getLogout)

module.exports = adminRouter