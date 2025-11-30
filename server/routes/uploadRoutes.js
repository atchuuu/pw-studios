const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        let uploadPath = 'uploads/temp/';

        if (req.query.type === 'profile') {
            uploadPath = 'uploads/profiles/';
        } else if (req.query.type === 'studio' && req.query.studioCode && req.query.category) {
            // Sanitize studioCode to prevent directory traversal or invalid chars
            const studioCode = req.query.studioCode.replace(/[^a-zA-Z0-9]/g, '');
            let category = 'exterior';
            if (req.query.category === 'interior') category = 'interior';
            if (req.query.category === 'cover') category = 'cover';
            uploadPath = `uploads/studios/${studioCode}/${category}/`;
        }

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    // Return path relative to server root, ensuring it starts with /
    res.send(`/${req.file.path}`);
});

module.exports = router;
