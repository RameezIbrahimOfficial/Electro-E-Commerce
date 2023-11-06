require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const { orderModel, productModel, categoryModel, adminModel } = require("../../Model");
const { getWeekNumber } = require("../../helpers");

const getAdminLogin = async (req, res) => {
  res.render("admin-login");
};

const postAdminLogin = async (req, res) => {
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

const getAdminPanel = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentWeek = getWeekNumber(currentDate);
    const currentDay = currentDate.getDate();

    const SalesOrders = await orderModel.find({ orderStatus: "Delivered" });

    const yearlySalesCounts = {};
    const monthlySalesCounts = {};
    const weeklySalesCounts = {};
    const dailySalesCounts = {};

    for (let year = currentYear; year > currentYear - 5; year--) {
      yearlySalesCounts[year] = 0;
    }

    for (let month = 0; month < 6; month++) {
      monthlySalesCounts[month] = 0;
    }

    for (let week = currentWeek; week > currentWeek - 7; week--) {
      weeklySalesCounts[week] = 0;
    }

    for (let day = currentDay; day > currentDay - 7; day--) {
      dailySalesCounts[day] = 0;
    }

    SalesOrders.forEach((order) => {
      if (order.deliveredOn instanceof Date) {
        const orderYear = order.deliveredOn.getFullYear();
        const orderMonth = order.deliveredOn.getMonth();
        const orderWeek = getWeekNumber(order.deliveredOn);
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

const getLogout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin");
};

module.exports = {
  getAdminLogin,
  postAdminLogin,
  getAdminPanel,
  getLogout
}