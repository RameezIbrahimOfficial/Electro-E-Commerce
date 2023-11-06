const multer = require('multer');

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'Public/uploads')
    },
    filename : (req, file, cb) => {
        cb(null, file.originalname)
    }
})

module.exports = { storage }