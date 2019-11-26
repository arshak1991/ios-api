const multer = require('multer');
const moment = require('moment');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, files, cb) {        
        if (req.route.path == '/user/avatar') {
            cb(null, path.resolve("./uploads/avatars/"))
        }
        if (files.mimetype == 'video/mp4') {
            cb(null, path.resolve("./uploads/videos/"))
        } else {
            if (files.fieldname == "imagePreview") {
                cb(null, path.resolve("./uploads/imgPreviews/"))
            } else {
                cb(null, path.resolve("./uploads/images/"))
            }
            
        }
        
    },
    filename(req, files, cb) {
        const date = moment().format('HHmmss_SSS');
        cb(null, `${date}-${files.originalname}`);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        const error = new Error('It is wrong File')
        error.status = 402
        cb(error);
        
    }
}

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 100 },
});