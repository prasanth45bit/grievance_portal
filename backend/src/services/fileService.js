const path = require("path");
const fs = require("fs");
const env = require("../config/environment");

const getFileUrl = (fileName) => {
  return `/uploads/${fileName}`;
};

const deleteFile = (fileName) => {
  const filePath = path.join(__dirname, "../../", env.UPLOAD_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

module.exports = {
  getFileUrl,
  deleteFile,
};
