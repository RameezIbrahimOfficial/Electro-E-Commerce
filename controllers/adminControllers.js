const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
require("dotenv").config();
const moment = require("moment");
const Excel = require("exceljs");
const path = require("path");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const sharp = require("sharp");

const JWT_SECRET = process.env.JWT_SECRET;

const { addressModel, adminModel, bannerModel, brandModel, cartModel, categoryModel, couponModel, customerModel, orderModel, productModel, wishlistModel } = require("../Model");

const {adminAuth} = require("../middlewares");

const adminHelpers = require("../helpers/adminHelpers");

module.exports.getAdminLogin = async (req, res) => {
  res.render("admin-login");
};

module.exports.postAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email: email });
    if (password === admin.password && email === admin.email) {
      const token = jwt.sign(admin.email, JWT_SECRET);
      res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000 });
      res.redirect("/admin/admin_panel");
    } else {
      res.render("admin-login", { errorMsg: "Incorrect Credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getAdminPanel = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentWeek = adminHelpers.getWeekNumber(currentDate);
    const currentDay = currentDate.getDate();

    const SalesOrders = await orderModel.find({ orderStatus: "Delivered" });

    const yearlySalesCounts = {};
    const monthlySalesCounts = {};
    const weeklySalesCounts = {};
    const dailySalesCounts = {};

    for (let year = currentYear; year > currentYear - 5; year--) {
      yearlySalesCounts[year] = 0;
    }

    for (let month = 0; month < 12; month++) {
      monthlySalesCounts[month] = 0;
    }

    for (let week = currentWeek; week > currentWeek - 5; week--) {
      weeklySalesCounts[week] = 0;
    }

    for (let day = currentDay; day > currentDay - 7; day--) {
      dailySalesCounts[day] = 0;
    }

    SalesOrders.forEach((order) => {
      if (order.deliveredOn instanceof Date) {
        const orderYear = order.deliveredOn.getFullYear();
        const orderMonth = order.deliveredOn.getMonth();
        const orderWeek = adminHelpers.getWeekNumber(order.deliveredOn);
        const orderDay = order.deliveredOn.getDate();

        if (!isNaN(orderMonth)) {
          monthlySalesCounts[orderMonth]++;
        }

        if (yearlySalesCounts[orderYear] !== undefined) {
          yearlySalesCounts[orderYear]++;
        }

        if (weeklySalesCounts[orderWeek] !== undefined) {
          weeklySalesCounts[orderWeek]++;
        }

        if (dailySalesCounts[orderDay] !== undefined) {
          dailySalesCounts[orderDay]++;
        }
      }
    });

    const currentMonthSalesCount = monthlySalesCounts[currentMonth];

    const orders = await orderModel.find({});
    const products = await productModel.find({});
    const categories = await categoryModel.find({});
    const cancelledOrder = await orderModel.find({ orderStatus: "Canceled" });
    const returnedOrder = await orderModel.find({ orderStatus: "Returned" });
    const deliveredOrder = await orderModel.find({ orderStatus: "Delivered" });
    const sales = await orderModel.find({ paymentStatus: "Success" });

    let revenue = 0;
    sales.forEach((sale) => {
      revenue += sale.totalAmount;
    });

    res.render("admin-dashboard", {
      orders,
      products,
      categories,
      revenue,
      cancelledOrder,
      returnedOrder,
      deliveredOrder,
      currentMonthSalesCount,
      monthlySalesCounts,
      yearlySalesCounts,
      weeklySalesCounts,
      dailySalesCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getProductsPage = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.render("admin-products-list", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getCategoriesPage = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.render("page-categories", { categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
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
    res.status(500).send("Internal Server Error");
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
    res.status(500).send("Internal Server Error");
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
    res.status(500).send("Internal Server Error");
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
    res.status(500).send("Internal Server Error");
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
    res.status(500).send("Internal Server Error");
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
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getAddProducts = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    const brands = await brandModel.find({});
    res.render("page-form-product-1", { categories, brands });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postAddProducts = async (req, res) => {
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

module.exports.getEditProducts = async (req, res) => {
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

module.exports.postEditProducts = async (req, res) => {
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

module.exports.getBlockProducts = async (req, res) => {
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

module.exports.getUnblockProducts = async (req, res) => {
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

module.exports.getBrands = async (req, res) => {
  try {
    brands = await brandModel.find({});
    res.render("page-brands", { brands });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postAddBrands = async (req, res) => {
  try {
    const brandLogo = req.file;
    await brandModel.create({
      id: req.body.brandId,
      brandName: req.body.brandName,
      isBlocked: req.body.isBlocked,
      brandImage: {
        fileName: brandLogo.filename,
        originalname: brandLogo.originalname,
        path: brandLogo.path,
      },
    });
    res.redirect("/admin/admin_panel/brands");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getBlockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await brandModel.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/admin_panel/brands");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getUnblockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await brandModel.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/admin_panel/brands");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getEditBrand = async (req, res) => {
  try {
    const id = req.query.id;
    const brands = await brandModel.find({});
    const brand = await brandModel.findOne({ _id: id });
    res.render("page-edit-brand", { brand, brands });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postEditBrand = async (req, res) => {
  try {
    const id = req.query.id;
    const brandImage = req.file;
    const brand = await brandModel.findOne({ _id: id });
    const newBrandImage = brandImage
      ? {
          fileName: brandImage.filename,
          originalname: brandImage.originalname,
          path: brandImage.path,
        }
      : brand.brandImage;

    await brandModel.updateOne(
      { _id: id },
      {
        $set: {
          id: req.body.brandId || brand.id,
          brandName: req.body.brandName || brand.brandName,
          isBlocked: req.body.isBlocked || brand.isBlocked,
          brandImage: newBrandImage,
        },
      }
    );
    res.redirect("/admin/admin_panel/brands");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getLogout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin");
};

module.exports.getOrderManagementPage = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.render("page-orders", { orders, moment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getOrderEditPage = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await orderModel.findOne({ _id: orderId }).populate({
      path: "products.productId",
      model: "Product",
    });
    res.render("page-orders-detail", { order });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postOrderEdit = async (req, res) => {
  try {
    const orderStatus = req.body.orderStatus;
    const orderId = req.body.orderId;
    const order = await orderModel.findOne({ _id: orderId });
    if (orderStatus) {
      await orderModel.updateOne(
        { _id: orderId },
        { $set: { orderStatus: orderStatus } }
      );
      res.redirect("/admin/order_management");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getBannerManagement = async (req, res) => {
  try {
    const banners = await bannerModel.find({});
    res.render("page-banner", { banners, moment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postAddBanner = async (req, res) => {
  try {
    const { description, startDate, endDate, isBlocked } = req.body;
    const { filename, originalname, path } = req.file;
    if (req.body && req.file) {
      await bannerModel
        .create({
          description,
          bannerImage: {
            filename,
            originalname,
            path,
          },
          startDate,
          endDate,
          status: isBlocked,
        })
        .then(() => {
          res.redirect("/admin/banner_management");
        });
    } else {
      res.redirect("/admin/banner_management");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getEditBannerPage = async (req, res) => {
  try {
    const banner = await bannerModel.findOne({ _id: req.query.bannerId });
    const banners = await bannerModel.find({});
    res.render("page-edit-banner", { banners, banner, moment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postUpdateBanner = async (req, res) => {
  try {
    const banner = await bannerModel.findOne({ _id: req.query.bannerId });
    const newbannerImage = req.file;

    const bannerImage = newbannerImage
      ? {
          filename: newbannerImage.originalname,
          originalname: newbannerImage.originalname,
          path: newbannerImage.path,
        }
      : banner.bannerImage;
    if (req.body) {
      const { description, startDate, endDate, isBlocked } = req.body;
      await bannerModel.updateOne(
        { _id: req.query.bannerId },
        {
          $set: {
            description: description || banner.description,
            bannerImage: bannerImage,
            startDate: startDate || banner.startDate,
            endDate: endDate || banner.endDate,
            status: isBlocked || banner.status,
          },
        }
      );

      res.redirect("/admin/banner_management");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getBlockBanner = async (req, res) => {
  try {
    await bannerModel.updateOne(
      { _id: req.query.bannerId },
      {
        $set: {
          status: true,
        },
      }
    );
    res.redirect("/admin/banner_management");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getUnblockBanner = async (req, res) => {
  try {
    await bannerModel.updateOne(
      { _id: req.query.bannerId },
      {
        $set: {
          status: false,
        },
      }
    );
    res.redirect("/admin/banner_management");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getSalesReportPage = async (req, res) => {
  try {
    const sales = await orderModel.find({ orderStatus: "Delivered" }).populate({
      path: "products.productId",
      model: "Product",
    });
    res.render("page-sales-report", { sales, moment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getMonthWeekYearSales = async (req, res) => {
  try {
    const filterOrdersForYear = adminHelpers.filterOrdersForYear;
    const filterOrdersForMonth = adminHelpers.filterOrdersForMonth;
    const filterOrdersForWeek = adminHelpers.filterOrdersForWeek;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentWeek = Math.ceil(currentDate.getDate() / 7);

    let orders = await orderModel.find({ orderStatus: "Delivered" });
    orders = await orderModel.populate(orders, {
      path: "products.productId",
      model: "Product",
    });

    const ordersThisYear = filterOrdersForYear(orders, currentYear);
    const ordersThisMonth = filterOrdersForMonth(
      orders,
      currentYear,
      currentMonth
    );
    const ordersThisWeek = filterOrdersForWeek(
      orders,
      currentYear,
      currentMonth,
      currentWeek
    );

    if (req.query.saleDate === "Month") {
      res.render("page-sales-report", { sales: ordersThisMonth, moment });
    }

    if (req.query.saleDate === "Week") {
      res.render("page-sales-report", { sales: ordersThisWeek, moment });
    }

    if (req.query.saleDate === "Year") {
      res.render("page-sales-report", { sales: ordersThisYear, moment });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
};

module.exports.salesReportExcel = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ orderStatus: "Delivered" })
      .populate({
        path: "products.productId",
        model: "Product",
      })
      .populate({
        path: "customerId",
        model: "Customers",
      });
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("sales report");
    const salesReportColumns = [
      { key: "orderId", header: "Order ID" },
      { key: "customerName", header: "Customer Name" },
      { key: "customerEmail", header: "Customer Email" },
      { key: "productDetails", header: "Product Details" },
      { key: "address", header: "Customer Address" },
      { key: "shippingCharge", header: "Shipping Charge" },
      { key: "discount", header: "Discount" },
      { key: "couponCode", header: "Coupon Code" },
      { key: "totalAmount", header: "Total Amount" },
      { key: "createdOn", header: "Order Date" },
      { key: "orderStatus", header: "Order Status" },
      { key: "paymentMethod", header: "Payment Method" },
      { key: "paymentStatus", header: "Payment Status" },
      { key: "deliveredOn", header: "Delivered Date" },
    ];
    worksheet.columns = salesReportColumns;

    orders.forEach((order) => {
      order.products.forEach((product) => {
        const salesData = {
          orderId: order.referenceId,
          customerName: order.customerId.firstName,
          customerEmail: order.customerId.email,
          productDetails: `${product.productId.productName}, Price: ${product.price}, Quantity: ${product.quantity}`,
          address: order.address,
          shippingCharge: order.shippingCharge,
          discount: order.discount,
          couponCode: order.couponCode,
          totalAmount: order.totalAmount,
          createdOn: order.createdOn,
          orderStatus: order.orderStatus,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          deliveredOn: order.deliveredOn,
        };
        worksheet.addRow(salesData);
      });
    });

    worksheet.columns.forEach((sheetColumn) => {
      sheetColumn.font = {
        size: 12,
      };
      sheetColumn.width = 30;
    });

    worksheet.getRow(1).font = {
      bold: true,
      size: 13,
    };
    const filePath = path.join(__dirname, "sales_report.xlsx");
    const exportPath = path.resolve(
      __dirname,
      "..",
      "Public",
      "sales-report",
      "sales_report.xlsx"
    );
    await workbook.xlsx.writeFile(exportPath);
    res.download(exportPath, "sales_report.xlsx", (err) => {
      if (err) {
        res.status(500).send("Error sending the file");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.salesReportPdf = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ orderStatus: "Delivered" })
      .populate({
        path: "products.productId",
        model: "Product",
      })
      .populate({
        path: "customerId",
        model: "Customers",
      });

    const doc = new PDFDocument();
    const filePath = path.resolve(
      __dirname,
      "..",
      "public",
      "sales-report",
      "sales_report.pdf"
    );
    doc.pipe(fs.createWriteStream(filePath));
    doc.fillColor("red");
    doc.text("SALES REPORT");
    doc.fillColor("black");

    doc.moveDown();
    orders.forEach((order) => {
      order.products.forEach((product) => {
        doc.moveDown();
        doc.fillColor("green");
        doc.text("NEW ORDER");
        doc.fillColor("black");
        doc.moveDown();

        const salesDataString = `
Order ID: ${order.referenceId}
Customer Name: ${order.customerId.firstName}
Customer Email: ${order.customerId.email}
Product Details: ${product.productId.productName}, Price: ${product.price}, Quantity: ${product.quantity}
Address: ${order.address}
Shipping Charge: ${order.shippingCharge}
Discount: ${order.discount}
Coupon Code: ${order.couponCode}
Total Amount: ${order.totalAmount}
Created On: ${order.createdOn}
Order Status: ${order.orderStatus}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}
Delivered On: ${order.deliveredOn}
`;

        doc.text(salesDataString);
      });
    });

    doc.end();

    res.download(filePath, "sales_report.pdf", (err) => {
      if (err) {
        res.status(500).send("Error sending the file");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating sales report");
  }
};

module.exports.getCouponManagementPage = async (req, res) => {
  try {
    const coupons = await couponModel.find({});
    res.render("page-coupon", { coupons, moment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postAddCoupon = async (req, res) => {
  try {
    const {
      couponCode,
      couponType,
      amount,
      description,
      minimumPurchase,
      expiryDate,
      status,
    } = req.body;
    await couponModel.create({
      couponCode,
      couponType,
      amount,
      description,
      minimumPurchase,
      expiryDate,
      status,
      redeemedUsers: [],
    });
    res.redirect("/admin/coupon");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getBlockCoupon = async (req, res) => {
  try {
    const { couponId } = req.query;
    await couponModel.updateOne(
      { _id: couponId },
      {
        $set: {
          status: "Unlist",
        },
      }
    );
    res.redirect("/admin/coupon");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getUnBlockCoupon = async (req, res) => {
  try {
    const { couponId } = req.query;
    await couponModel.updateOne(
      { _id: couponId },
      {
        $set: {
          status: "List",
        },
      }
    );
    res.redirect("/admin/coupon");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.getEditCouponPage = async (req, res) => {
  try {
    const { couponId } = req.query;
    const coupon = await couponModel.findOne({ _id: couponId });
    const coupons = await couponModel.find({});
    res.render("page-edit-coupon", { coupon, coupons, moment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.postEditCoupon = async (req, res) => {
  try {
    const { couponId } = req.query;
    const {
      couponCode,
      couponType,
      amount,
      description,
      minimumPurchase,
      expiryDate,
      status,
    } = req.body;
    const coupon = await couponModel.findOne({ _id: couponId });
    await couponModel.updateOne(
      { _id: couponId },
      {
        $set: {
          couponCode,
          couponType,
          amount,
          description,
          minimumPurchase,
          expiryDate,
          status,
          redeemedUsers: coupon.redeemedUsers,
        },
      }
    );
    res.redirect("/admin/coupon");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
