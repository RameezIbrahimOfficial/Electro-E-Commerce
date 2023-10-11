module.exports.currentRouter = (req, res, next) => {
    res.locals.currentRoute = req.path;
    next();
  };