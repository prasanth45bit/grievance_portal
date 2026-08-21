const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/environment");

// Ensure upload directory exists
const uploadPath = path.join(__dirname, "../../", env.UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File Filter Configuration
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const mimeType = allowedExtensions.test(file.mimetype);
  const extName = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error("Only images in JPG, JPEG, PNG or WEBP format are allowed."));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
