const moment = require('moment')
const { orderModel } = require('../../Model')

const getOrderManagementPage = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.render("page-orders", { orders, moment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const getOrderEditPage = async (req, res) => {
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

const postOrderEdit = async (req, res) => {
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

module.exports = {
  getOrderManagementPage,
  getOrderEditPage,
  postOrderEdit
}