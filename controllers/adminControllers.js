const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;

const adminModel = require("../Model/adminSchema");
const categoryModel = require("../Model/categorySchema");
const customerModel = require("../Model/customerSchema");
const productsModel = require("../Model/productSchema");
const middlewares = require("../middlewares/middlewares");

module.exports.getAdminLogin = async (req, res) => {
  res.render("admin-login");
};

module.exports.postAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email: email });
    if (password === admin.password && email === admin.email) {
      const token = jwt.sign(admin.email,JWT_SECRET)
      res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 })
      res.redirect("/admin/admin_panel");
    } else {
      res.render("admin-login", { errorMsg: "Incorrect Credentials" });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getAdminPanel = (req, res) => {
      res.render("admin-dashboard");
};

module.exports.getProductsPage = async (req, res) => {
  try {
    const products = await productsModel.find({});
    res.render("admin-products-list", { products });
  } catch (err) {
    console.error(err);
  }
};

module.exports.getCategoriesPage = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.render("page-categories", { categories });
  } catch (err) {
    console.error(err);
  }
};

module.exports.getEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categories = await categoryModel.find({});
    const category = await categoryModel.findOne({ _id: id });
    res.render("page-edit-categories", { categories, category });
  } catch (err) {
    console.error(err);
  }
};

module.exports.postEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await categoryModel.findOne({ _id: id });
    await categoryModel.updateOne(
      { _id: id },
      {
        $set: {
          categoryId: req.body.categoryId || category.categoryId,
          categoryName: req.body.categoryName || category.categoryName,
          isListed: req.body.status || category.status,
        },
      }
    );
    res.redirect("/admin/admin_panel/categories");
  } catch (err) {
    console.error(err);
  }
};

module.exports.getBlockCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await categoryModel.updateOne(
      { _id: id },
      { $set: { isListed: "Unilisted" } }
    );
    res.redirect("/admin/admin_panel/categories");
  } catch (err) {
    console.error(err);
  }
};

module.exports.getUnblockCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await categoryModel.updateOne(
      { _id: id },
      { $set: { isListed: "Listed" } }
    );
    res.redirect("/admin/admin_panel/categories");
  } catch (err) {
    console.error(err);
  }
};

module.exports.postCreateCategory = async (req, res) => {
  try {
    await categoryModel.create({
      categoryId: req.body.categoryId,
      categoryName: req.body.categoryName,
      categoryDescription: req.body.categoryDescription,
      isListed: req.body.status,
    });
    res.redirect("/admin/admin_panel/categories");
  } catch (err) {
    console.error(err);
  }
};

module.exports.getUserManagement = async (req, res) => {
  try {
    if (req.query.id) {
      id = req.query.id;
      const user = await customerModel.findOne({ _id: id });
      if (user) {
        if (user.isBlocked) {
          await customerModel.updateOne(
            { _id: id },
            { $set: { isBlocked: false } }
          );
          res.redirect("/admin/admin_panel/user_management");
        } else {
          await customerModel.updateOne(
            { _id: id },
            { $set: { isBlocked: true } }
          );
          res.redirect("/admin/admin_panel/user_management");
        }
      }
    }
    const users = await customerModel.find({});
    res.render("page-users", { users });
  } catch (err) {
    console.error(err);
  }
};

module.exports.getAddProducts = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.render("page-form-product-1", { categories });
  } catch (err) {
    console.error(err);
  }
};

module.exports.postAddProducts = async (req, res) => {
  try {
    const images = req.files;
    const productImages = [];
    for (let i = 0; i < images.length; i++) {
      productImages.push({
        fileName: images[i].originalname,
        mimeType: images[i].mimetype,
        buffer: images[i].buffer,
      });
    }
    await productsModel.create({
      id: req.body.product_id,
      productName: req.body.product_name,
      description: req.body.product_description,
      brand: req.body.product_brand,
      category: req.body.product_category,
      regularPrice: req.body.regular_price,
      salePrice: req.body.sales_price,
      createdOn: new Date(),
      stock: req.body.stock,
      units: req.body.units,
      productImage: productImages,
      operatingSystem:req.body.operatingSystem,
      cellularTechnology:req.body.cellularTechnology,
      internalMemory:req.body.internalMemory,
      ram:req.body.ram,
      screenSize:req.body.screenSize,
      batteryCapacity:req.body.batteryCapacity,
      processor:req.body.processor
    });
    res.redirect("/admin/admin_panel/add_products");
  } catch (err) {
    console.log(err);
  }
};

module.exports.getEditProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await productsModel.find({ _id: id });
    const categories = await categoryModel.find({});
    res.render("page-edit-product", { product, categories });
  } catch (err) {
    console.error(err);
  }
};

module.exports.postEditProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await productsModel.findOne({ _id: id });
    const images = req.files;
    const productImages = [];
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        productImages.push({
          fileName: images[i].originalname,
          mimeType: images[i].mimetype,
          buffer: images[i].buffer,
        });
      }
    } else {
      for (let i = 0; i < product.productImage.length; i++) {
        productImages.push({
          fileName: product.productImage[i].fileName,
          mimeType: product.productImage[i].mimetype,
          buffer: product.productImage[i].buffer,
        });
      }
    }
    await productsModel.updateOne(
      { _id: id },
      {
        $set: {
          id: req.body.product_id || product.id,
          productName: req.body.product_name || product.productName,
          description: req.body.product_description || product.description,
          brand: req.body.product_brand || product.brand,
          category: req.body.product_category || product.category,
          regularPrice: req.body.regular_price || product.regularPrice,
          salePrice: req.body.sales_price || product.salePrice,
          createdOn: new Date() || product.createdOn,
          stock: req.body.stock || product.stock,
          units: req.body.units || product.units,
          productImage: productImages,
          operatingSystem:req.body.operatingSystem || product.operatingSystem,
          cellularTechnology:req.body.cellularTechnology || product.cellularTechnology,
          internalMemory:req.body.internalMemory || product.internalMemory,
          ram:req.body.ram || product.ram,
          screenSize:req.body.screenSize || product.screenSize,
          batteryCapacity:req.body.batteryCapacity || product.batteryCapacity,
          processor:req.body.processor || product.processor
        },
      }
    );
    res.redirect("/admin/admin_panel/products");
  } catch (err) {
    console.error(err);
  }
};

module.exports.getBlockProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await productsModel.findOne({ _id: id });
    if (product.isBlocked) {
      res.redirect("/admin/admin_panel/products");
    } else {
      await productsModel.updateOne({ _id: id }, { isBlocked: true });
      res.redirect("/admin/admin_panel/products");
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getUnblockProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await productsModel.findOne({ _id: id });
    if (product.isBlocked) {
      const data = await productsModel.updateOne(
        { _id: id },
        { $set: { isBlocked: false } }
      );
      res.redirect("/admin/admin_panel/products");
    } else {
      res.redirect("/admin/admin_panel/products");
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getLogout = (req,res)=>{
  res.clearCookie('token');
  res.redirect('/admin')
}