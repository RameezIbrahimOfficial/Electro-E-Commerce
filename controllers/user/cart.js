const { customerModel, cartModel } = require("../../Model");

// Display Cart Page
const getCartPage = async (req, res) => {
  try {
    const productId = req.query.productId;
    const isLogin = req.cookies.isLogin;
    const user = req.user;
    const userId = await customerModel.findOne({ email: user }, { _id: 1 });
    const userCart = await cartModel.findOne({ userId: userId._id }).populate({
      path: "products.productId",
      model: "Product",
    });
    let grandTotal = 0;
    if (userCart) {
      for (let i = 0; i < userCart.products.length; i++) {
        grandTotal =
          grandTotal +
          userCart.products[i].productId.salePrice *
          userCart.products[i].quantity;
      }
    }
    res.render("cart", { userCart, isLogin, grandTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add products to CART ( POST )
const postAddToCart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const quantity = Number(req.body.quantity);
    if (productId) {
      const currentUser = await customerModel.findOne({ email: req.user });
      if (!currentUser) {
        return res.redirect("/signin");
      }
      const userCart = await cartModel.findOne({ userId: currentUser._id });
      if (userCart) {
        let productIndex = -1;
        productIndex = userCart.products.findIndex(
          (product) => product.productId == productId
        );

        if (productIndex !== -1) {
          userCart.products[productIndex].quantity += quantity;
        } else {
          userCart.products.push({ productId, quantity: quantity });
        }

        await userCart.save();
      } else {
        const newCart = new cartModel({
          userId: currentUser._id,
          products: [{ productId, quantity: 1 }],
        });
        await newCart.save();
      }
      res.status(200).json({ data: productId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete products from CART
const getDeleteCart = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.query.productId;
    const userDocument = await customerModel.findOne({ email: user });
    if (!userDocument) {
      return res.status(404).send("User not found");
    }
    const userId = userDocument._id;
    await cartModel.updateOne(
      { userId },
      {
        $pull: { products: { productId: productId } },
      }
    );
    res.redirect("/cart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Update Cart Quanity on Cart Quantity Increment
const postCartUpdate = async (req, res) => {
  try {
    const productId = req.body.productId;
    const quantity = Number(req.body.quantity);

    if (productId && quantity) {
      const currentUser = await customerModel.findOne({ email: req.user });

      if (!currentUser) {
        return res.redirect("/signin");
      }

      let userCart = await cartModel.findOne({ userId: currentUser._id });
      if (!userCart) {
        userCart = new cartModel({
          userId: currentUser._id,
          products: [{ productId, quantity }],
        });
      } else {
        const productIndex = userCart.products.findIndex(
          (product) => product.productId == productId
        );

        if (productIndex !== -1) {
          userCart.products[productIndex].quantity = quantity;
        } else {
          userCart.products.push({ productId, quantity });
        }
      }

      await userCart.save();
      res.status(200).json({ message: "Updated Cart" });
    } else {
      res.status(400).json({ message: "Invalid input" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCartPage,
  postAddToCart,
  getDeleteCart,
  postCartUpdate
}