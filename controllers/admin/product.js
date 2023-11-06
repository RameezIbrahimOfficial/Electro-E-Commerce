const sharp = require("sharp");
const {productModel, categoryModel, brandModel} = require('../../Model')

const getProductsPage = async (req, res) => {
    try {
      const products = await productModel.find({});
      res.render("admin-products-list", { products });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };

  const getAddProducts = async (req, res) => {
    try {
      const categories = await categoryModel.find({});
      const brands = await brandModel.find({});
      res.render("page-form-product-1", { categories, brands });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const postAddProducts = async (req, res) => {
    try {
      const images = req.files;
      const productImages = [];
  
      for (let i = 0; i < images.length; i++) {
        const croppedImage = await sharp(images[i].path)
          .resize({ width: 300 })
          .toBuffer();
  
        const filename = `cropped_${images[i].filename}`;
        const filePath = `Public/uploads/${filename}`;
        await sharp(croppedImage).toFile(filePath);
  
        productImages.push({
          fileName: filename,
          originalname: images[i].originalname,
          path: filePath,
        });
      }
      await productModel.create({
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
        operatingSystem: req.body.operatingSystem,
        cellularTechnology: req.body.cellularTechnology,
        internalMemory: req.body.internalMemory,
        ram: req.body.ram,
        screenSize: req.body.screenSize,
        batteryCapacity: req.body.batteryCapacity,
        processor: req.body.processor,
      });
      res.redirect("/admin/admin_panel/products");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const getEditProducts = async (req, res) => {
    try {
      const id = req.query.id;
      const product = await productModel.find({ _id: id });
      const categories = await categoryModel.find({});
      res.render("page-edit-product", { product, categories });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const postEditProducts = async (req, res) => {
    try {
      const id = req.query.id;
      const product = await productModel.findOne({ _id: id });
      const images = req.files;
      const productImages = [];
  
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const croppedImage = await sharp(images[i].path)
            .resize({ width: 300 })
            .toBuffer();
  
          const filename = `cropped_${images[i].filename}`;
          const filePath = `Public/uploads/${filename}`;
          await sharp(croppedImage).toFile(filePath);
  
          productImages.push({
            fileName: filename,
            originalname: images[i].originalname,
            path: filePath,
          });
        }
      } else {
        for (let i = 0; i < product.productImage.length; i++) {
          productImages.push({
            fileName: product.productImage[i].fileName,
            originalname: product.productImage[i].originalname,
            path: product.productImage[i].path,
          });
        }
      }
  
      await productModel.updateOne(
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
            operatingSystem: req.body.operatingSystem || product.operatingSystem,
            cellularTechnology:
              req.body.cellularTechnology || product.cellularTechnology,
            internalMemory: req.body.internalMemory || product.internalMemory,
            ram: req.body.ram || product.ram,
            screenSize: req.body.screenSize || product.screenSize,
            batteryCapacity: req.body.batteryCapacity || product.batteryCapacity,
            processor: req.body.processor || product.processor,
          },
        }
      );
      res.redirect("/admin/admin_panel/products");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const getBlockProducts = async (req, res) => {
    try {
      const id = req.query.id;
      const product = await productModel.findOne({ _id: id });
      if (product.isBlocked) {
        res.redirect("/admin/admin_panel/products");
      } else {
        await productModel.updateOne({ _id: id }, { isBlocked: true });
        res.redirect("/admin/admin_panel/products");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const getUnblockProducts = async (req, res) => {
    try {
      const id = req.query.id;
      const product = await productModel.findOne({ _id: id });
      if (product.isBlocked) {
        const data = await productModel.updateOne(
          { _id: id },
          { $set: { isBlocked: false } }
        );
        res.redirect("/admin/admin_panel/products");
      } else {
        res.redirect("/admin/admin_panel/products");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };

module.exports = {
    getProductsPage,
    getAddProducts,
    getEditProducts,
    postAddProducts,
    postEditProducts,
    getBlockProducts,
    getUnblockProducts
}