const { customerModel, addressModel, cartModel } = require("../../Model");

// Display Checkout Page
const getCheckoutPage = async (req, res) => {
    try {
      const isLogin = req.cookies.isLogin;
      const user = await customerModel.findOne({ email: req.user });
      const userAddress = await addressModel.findOne({ userId: user._id });
      const userCart = await cartModel.findOne({ userId: user._id }).populate({
        path: "products.productId",
        model: "Product",
      });
      if (userCart && userCart.products.length > 0) {
        let grandTotal = 0;
        const stockCheck = [];
        for (let i = 0; i < userCart.products.length; i++) {
          const product = userCart.products[i].productId;
          const quantityInCart = userCart.products[i].quantity;
  
          if (quantityInCart > product.units) {
            stockCheck.push(
              `Product "${product.productName}" has only ${product.units} units available.`
            );
          }
  
          grandTotal += product.salePrice * quantityInCart;
        }
  
        res.render("checkout", {
          isLogin,
          userAddress,
          userCart,
          grandTotal,
          stockCheck,
        });
      } else {
        res.redirect("/products");
      }
    } catch (error) {
      console.error(error);
    }
  };
  
module.exports = { getCheckoutPage }