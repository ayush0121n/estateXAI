const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Determine if Cloudinary is configured
const useCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

let upload;

if (useCloudinary) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'estatexai',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1280, height: 960, crop: 'limit' }]
        }
    });

    upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
    console.log('[Upload] Using Cloudinary storage');
} else {
    // Fallback: local storage
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + path.extname(file.originalname));
        }
    });

    upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowed = /jpeg|jpg|png|webp/;
            if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
            else cb(new Error('Only image files are allowed'));
        }
    });
    console.log('[Upload] Using local disk storage (no Cloudinary env vars found)');
}

/**
 * Process uploaded files into URL strings.
 * Works for both Cloudinary (req.files[i].path) and local (builds /uploads/... URL).
 */
function getImageUrls(req) {
    if (!req.files || req.files.length === 0) return [];
    return req.files.map(file => {
        // Cloudinary sets file.path to the Cloudinary HTTPS URL
        if (useCloudinary) return file.path;
        // Local: build the public URL
        const baseUrl = process.env.BACKEND_URL || ('http://localhost:' + (process.env.PORT || 5000));
        return baseUrl + '/uploads/' + file.filename;
    });
}

module.exports = { upload, getImageUrls, useCloudinary };
