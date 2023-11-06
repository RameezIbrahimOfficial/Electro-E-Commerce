const { brandModel } = require('../../Model')

const getBrands = async (req, res) => {
  try {
    brands = await brandModel.find({});
    res.render("page-brands", { brands });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const postAddBrands = async (req, res) => {
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

const getBlockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await brandModel.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/admin_panel/brands");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getUnblockBrand = async (req, res) => {
  try {
    const id = req.query.id;
    await brandModel.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/admin_panel/brands");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getEditBrand = async (req, res) => {
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

const postEditBrand = async (req, res) => {
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

module.exports = {
  getBrands,
  postAddBrands,
  getBlockBrand,
  getUnblockBrand,
  getEditBrand,
  postEditBrand
}