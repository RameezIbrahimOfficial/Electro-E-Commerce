const { customerModel, wishlistModel } = require("../../Model");

// Display Wishlist Page
const getWishlistPage = async (req, res) => {
    try {
      const user = await customerModel.findOne({ email: req.user }, { _id: 1 });
      const userWishlist = await wishlistModel
        .findOne({ userId: user._id })
        .populate({
          path: "products.productId",
          model: "Product",
        });
      const isLogin = req.cookies.isLogin;
      res.render("wishlist", { isLogin, userWishlist });
    } catch (error) {
      console.error(error);
    }
  };
  
  // Add products to Wishlist
  const postAddToWishlist = async (req, res) => {
    try {
      const productId = req.body.productId;
      if (productId) {
        const currentUser = await customerModel.findOne({ email: req.user });
        if (!currentUser) {
          return res.redirect("/signin");
        }
        const userWishlist = await wishlistModel.findOne({
          userId: currentUser._id,
        });
        if (userWishlist) {
          let productIndex = -1;
          productIndex = userWishlist.products.findIndex(
            (product) => product.productId == productId
          );
  
          if (productIndex === -1) {
            userWishlist.products.push({ productId });
            await userWishlist.save();
          }
        } else {
          const newWishlist = new wishlistModel({
            userId: currentUser._id,
          });
          await newWishlist.save();
        }
        res.status(200).json({ message: "Added to Wishlist" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // Delete Product from Wishlist
  const getDeleteWishlist = async (req, res) => {
    try {
      const user = req.user;
      const productId = req.query.productId;
      const userDocument = await customerModel.findOne({ email: user });
      if (!userDocument) {
        return res.status(404).send("User not found");
      }
      const userId = userDocument._id;
      await wishlistModel.updateOne(
        { userId },
        {
          $pull: { products: { productId: productId } },
        }
      );
      res.redirect("/wishlist");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

module.exports = {
    getWishlistPage,
    postAddToWishlist,
    getDeleteWishlist
}