const {customerModel, walletModel, couponModel, cartModel, addressModel, orderModel, productModel} = require('../../Model')

// Display Wallet Page
const getWalletPage = async(req, res) => {
    try {
      const user = await customerModel.findOne({email:req.user})
      const wallet = await walletModel.findOne({userId:user._id})
      const isLogin = req.cookies.isLogin;
      res.render('wallet',{isLogin, wallet})
    } catch ( error ) {
      console.error(error);
    }
}

// Place order Wallet
const getPlaceOrderWallet = async (req, res) => {
    try {
      const user = await customerModel.findOne({ email: req.user });
      const { grantTotal, couponCode } = req.query;
      const wallet = await walletModel.findOne({userId:user._id})
      if(wallet.amount>=grantTotal){
      let totalAmount = 0;
      const coupon = await couponModel.findOne({ couponCode: couponCode });
      const walletAmount = wallet.amount;
      const finalWalletAmount = walletAmount-grantTotal;
  
      let discountAmount = 0;
      if (coupon) {
        discountAmount = coupon.amount;
      }
      const cart = await cartModel.findOne({ userId: user._id }).populate({
        path: "products.productId",
        model: "Product",
      });
      const address = await addressModel.findOne(
        { "address._id": req.query.addressId },
        { "address.$": 1 }
      );
      const productArray = [];
      cart.products.forEach((product) => {
        productArray.push({
          productId: product.productId._id,
          quantity: product.quantity,
          price: product.productId.salePrice,
        });
      });
      cart.products.forEach((product) => {
        totalAmount += product.quantity * product.productId.salePrice;
      });
      await orderModel
        .create({
          customerId: user._id,
          products: productArray,
          address: {
            addressType: address.address[0].addressType,
            name: address.address[0].name,
            city: address.address[0].city,
            landMark: address.address[0].landMark,
            state: address.address[0].state,
            pincode: address.address[0].pincode,
            phone: address.address[0].phone,
            altPhone: address.address[0].altPhone,
          },
          paymentMethod: "Wallet",
          referenceId: "order_a456tfk4",
          shippingCharge: 0,
          discount: discountAmount,
          totalAmount: grantTotal,
          createdOn: new Date(),
          orderStatus: "Order Placed",
          paymentStatus: "Success",
          deliveredOn: new Date(),
          couponCode: couponCode,
        })
        .then(async () => {
          for (const product of cart.products) {
            await productModel.updateOne(
              { _id: product.productId._id },
              { $inc: { units: -product.quantity } }
            );
          }
          await cartModel.deleteOne({ userId: user._id });
        });
        await walletModel.updateOne({userId:user._id}, {
          $set : {
            amount:finalWalletAmount
          }
        })
        res.status(200).json({ data : "Order Placed!" })
      } else {
        res.status(500).json({ data : "Insufficient Balance in Wallet, Try with another payement method!" })
      }
  
    } catch (error) {
      console.error(error);
    }
};

module.exports = {
    getWalletPage,
    getPlaceOrderWallet
}  