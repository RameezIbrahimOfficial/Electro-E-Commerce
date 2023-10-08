const express = require('express');
const multer = require('multer');
const adminControllers = require('../controllers/adminControllers');

const storage = multer.memoryStorage();
const upload = multer({storage:storage})

const adminRouter = express.Router();

adminRouter.use(express.static('Public'))
adminRouter.use('/admin_panel', express.static('Public'));
adminRouter.use(express.json());
adminRouter.use(express.urlencoded({extended:true}));

adminRouter.get('/',adminControllers.getAdminLogin)
adminRouter.post('/admin_login',adminControllers.postAdminLogin)
adminRouter.get('/admin_panel',adminControllers.getAdminPanel)
adminRouter.get('/admin_panel/products',adminControllers.getProductsPage)
adminRouter.get('/admin_panel/add_products',adminControllers.getAddProducts)
adminRouter.post('/admin_panel/add_products',upload.array('product_images'),adminControllers.postAddProducts)
adminRouter.get('/edit_products',adminControllers.getEditProducts)
adminRouter.post('/edit_products',upload.array('product_images'),adminControllers.postEditProducts)
adminRouter.get('/block_products',adminControllers.getBlockProducts)
adminRouter.get('/unblock_products',adminControllers.getUnblockProducts)
adminRouter.get('/admin_panel/categories',adminControllers.getCategoriesPage)
adminRouter.get('/admin_panel/edit_category',adminControllers.getEditCategory)
adminRouter.post('/admin_panel/edit_category',adminControllers.postEditCategory)
adminRouter.get('/admin_panel/block_category',adminControllers.getBlockCategory)
adminRouter.get('/admin_panel/unblock_category',adminControllers.getUnblockCategory)
adminRouter.post('/admin_panel/ceate_category',adminControllers.postCreateCategory)
adminRouter.get('/admin_panel/user_management',adminControllers.getUserManagement)

module.exports = adminRouter