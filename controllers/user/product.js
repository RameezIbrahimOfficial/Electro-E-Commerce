const { categoryModel, brandModel, productModel } = require("../../Model");

// Display products Page
const getProductsPage = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = 9;
    const isLogin = req.cookies.isLogin;
    const categories = await categoryModel.find({});
    const brands = await brandModel.find({});
    const products = await productModel
      .aggregate([
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ])
      .exec();
    res.render("products-grid-view", { products, categories, brands, isLogin });
  } catch (err) {
    console.error(err);
  }
};

// Display Indivitual Product page
const getProductPage = async (req, res) => {
  try {
    const isLogin = req.cookies.isLogin;
    const id = req.query.id;
    const product = await productModel.findOne({ _id: id });
    const brand = await brandModel.findOne({ brandName: product.brand });
    res.render("shop-product-full", { product, brand, isLogin });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getProductPage,
  getProductsPage
}