const { customerModel, couponModel } = require("../../Model");

// Redeem Coupon While Checkout
const postRedeemCoupon = async (req, res) => {
    try {
      const { couponCode } = req.body;
      const user = await customerModel.findOne({ email: req.user });
      const coupon = await couponModel.findOne({ couponCode: couponCode });
      if (!coupon) {
        return res.status(500).json({ data: "No coupon Found" });
      }
  
      const isRedeemed = coupon.redeemedUsers.some((redeemedUser) =>
        redeemedUser.equals(user._id)
      );
  
      if (isRedeemed) {
        return res.status(500).json({ data: "Coupon Already Redeemed By user" });
      } else {
        coupon.redeemedUsers.push(user._id);
        await coupon.save();
        return res.status(200).json({ data: "Coupon Found", coupon: coupon });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ data: "An error occurred" });
    }
  };

module.exports = { postRedeemCoupon }