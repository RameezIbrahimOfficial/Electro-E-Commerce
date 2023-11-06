// Display Contact Page
const getContactPage = (req, res) => {
    const isLogin = req.cookies.isLogin;
    res.render("page-contact", { isLogin });
  };

module.exports = { getContactPage }