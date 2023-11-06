const {categoryModel} = require('../../Model')

const getCategoriesPage = async (req, res) => {
    try {
      const categories = await categoryModel.find({});
      res.render("page-categories", { categories });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
const getEditCategory = async (req, res) => {
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
  
const postEditCategory = async (req, res) => {
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
  
const getBlockCategory = async (req, res) => {
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
  
const getUnblockCategory = async (req, res) => {
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
  
const postCreateCategory = async (req, res) => {
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

module.exports = {
    getCategoriesPage,
    getEditCategory,
    postEditCategory,
    getBlockCategory,
    getUnblockCategory,
    postCreateCategory
}