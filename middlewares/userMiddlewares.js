module.exports.errorHandlingMiddleware = (err, req, res, next) => {
    res.render('page-404')
  }