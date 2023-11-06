const { categoryModel, brandModel, productModel } = require("../../Model");

// User Product Search
const getSearch = async (req, res) => {
    try {
      const product_search = req.query.product_search;
      const search_category = req.query.category;
      const isLogin = req.cookies.isLogin;
      const categories = await categoryModel.find({});
      const brands = await brandModel.find({});
      if (search_category) {
        const products = await productModel.find({ category: search_category });
        res.render("products-grid-view", {
          products,
          categories,
          brands,
          isLogin,
        });
      }
      if (product_search) {
        const products = await productModel.find({
          productName: { $regex: `^${product_search}`, $options: "xi" },
        });
        res.render("products-grid-view", {
          products,
          categories,
          brands,
          isLogin,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  // Filter Products in Products Page
  const postSearch = async (req, res) => {
    try {
      const categories = await categoryModel.find({});
      const brands = await brandModel.find({});
      const isLogin = req.cookies.isLogin;
      const {
        ram,
        price,
        brand,
        internal_memory,
        battery_capacity,
        operating_system,
      } = req.body;
      const aggregationStages = [];
      const orConditions = [];
      const ramArray = [],
        priceArray = [],
        internal_memoryArray = [],
        brandArray = [],
        battery_capacityArray = [],
        operating_systemArray = [];
  
      // Build an array of $or conditions for each field with multiple values
      if (ram && ram.length > 0) {
        if (Array.isArray(ram)) {
          orConditions.push({ ram: { $in: ram.map(Number) } });
        } else {
          ramArray.push(ram);
          orConditions.push({ ram: { $in: ramArray.map(Number) } });
        }
      }
  
      if (price && price.length > 0) {
        if (Array.isArray(price)) {
          orConditions.push({ salePrice: { $in: price.map(Number) } });
        } else {
          priceArray.push(price);
          orConditions.push({ salePrice: { $in: priceArray.map(Number) } });
        }
      }
  
      if (brand && brand.length > 0) {
        if (Array.isArray(brand)) {
          orConditions.push({ brand: { $in: brand } });
        } else {
          brandArray.push(brand);
          orConditions.push({ brand: { $in: brandArray } });
        }
      }
  
      if (internal_memory && internal_memory.length > 0) {
        if (Array.isArray(internal_memory)) {
          orConditions.push({
            internalMemory: { $in: internal_memory.map(Number) },
          });
        } else {
          internal_memoryArray.push(internal_memory);
          orConditions.push({
            internalMemory: { $in: internal_memoryArray.map(Number) },
          });
        }
      }
  
      if (battery_capacity && battery_capacity.length > 0) {
        if (Array.isArray(battery_capacity)) {
          orConditions.push({
            batteryCapacity: { $in: battery_capacity.map(Number) },
          });
        } else {
          battery_capacityArray.push(battery_capacity);
          orConditions.push({
            batteryCapacity: { $in: battery_capacityArray.map(Number) },
          });
        }
      }
  
      if (operating_system && operating_system.length > 0) {
        if (Array.isArray(operating_system)) {
          orConditions.push({ category: { $in: operating_system } });
        } else {
          operating_systemArray.push(operating_system);
          orConditions.push({ category: { $in: operating_systemArray } });
        }
      }
  
      if (orConditions.length > 0) {
        aggregationStages.push({
          $match: {
            $or: orConditions,
          },
        });
      }
  
      if (aggregationStages.length > 0) {
        const products = await productModel.aggregate(aggregationStages);
        res.render("products-grid-view", {
          products,
          categories,
          brands,
          isLogin,
        });
      } else {
        const products = await productModel.find({});
        res.render("products-grid-view", {
          products,
          categories,
          brands,
          isLogin,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

module.exports = {
    getSearch,
    postSearch
}