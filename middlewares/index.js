const adminAuth = require('./adminAuth');
const adminMiddleware = require('./adminMiddleware');
const userAuth = require('./userAuth');
const userMiddleware = require('./userMiddlewares');

module.exports = {
    adminAuth, adminMiddleware, userAuth, userMiddleware
}