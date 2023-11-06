const moment = require('moment')
const {bannerModel} = require('../../Model') 

const getBannerManagement = async (req, res) => {
    try {
      const banners = await bannerModel.find({});
      res.render("page-banner", { banners, moment });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const postAddBanner = async (req, res) => {
    try {
      const { description, startDate, endDate, isBlocked } = req.body;
      const { filename, originalname, path } = req.file;
      if (req.body && req.file) {
        await bannerModel
          .create({
            description,
            bannerImage: {
              filename,
              originalname,
              path,
            },
            startDate,
            endDate,
            status: isBlocked,
          })
          .then(() => {
            res.redirect("/admin/banner_management");
          });
      } else {
        res.redirect("/admin/banner_management");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const getEditBannerPage = async (req, res) => {
    try {
      const banner = await bannerModel.findOne({ _id: req.query.bannerId });
      const banners = await bannerModel.find({});
      res.render("page-edit-banner", { banners, banner, moment });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const postUpdateBanner = async (req, res) => {
    try {
      const banner = await bannerModel.findOne({ _id: req.query.bannerId });
      const newbannerImage = req.file;
  
      const bannerImage = newbannerImage
        ? {
            filename: newbannerImage.originalname,
            originalname: newbannerImage.originalname,
            path: newbannerImage.path,
          }
        : banner.bannerImage;
      if (req.body) {
        const { description, startDate, endDate, isBlocked } = req.body;
        await bannerModel.updateOne(
          { _id: req.query.bannerId },
          {
            $set: {
              description: description || banner.description,
              bannerImage: bannerImage,
              startDate: startDate || banner.startDate,
              endDate: endDate || banner.endDate,
              status: isBlocked || banner.status,
            },
          }
        );
  
        res.redirect("/admin/banner_management");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const getBlockBanner = async (req, res) => {
    try {
      await bannerModel.updateOne(
        { _id: req.query.bannerId },
        {
          $set: {
            status: true,
          },
        }
      );
      res.redirect("/admin/banner_management");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const getUnblockBanner = async (req, res) => {
    try {
      await bannerModel.updateOne(
        { _id: req.query.bannerId },
        {
          $set: {
            status: false,
          },
        }
      );
      res.redirect("/admin/banner_management");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

module.exports = {
    getBannerManagement,
    postAddBanner,
    getEditBannerPage,
    postUpdateBanner,
    getBlockBanner,
    getUnblockBanner
}