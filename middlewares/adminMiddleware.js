module.exports.currentRouter = (req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
};

module.exports.errorHandlingMiddleware = (err, req, res, next) => {
  res.render('page-404')
}