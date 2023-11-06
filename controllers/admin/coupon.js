const moment = require('moment')
const {couponModel} = require('../../Model')

const getCouponManagementPage = async (req, res) => {
    try {
      const coupons = await couponModel.find({});
      res.render("page-coupon", { coupons, moment });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const postAddCoupon = async (req, res) => {
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
  
  const getBlockCoupon = async (req, res) => {
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
  
  const getUnBlockCoupon = async (req, res) => {
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
  
  const getEditCouponPage = async (req, res) => {
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
  
  const postEditCoupon = async (req, res) => {
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

module.exports = {
    getCouponManagementPage,
    postAddCoupon,
    getBlockCoupon,
    getUnBlockCoupon,
    getEditCouponPage,
    postEditCoupon
}