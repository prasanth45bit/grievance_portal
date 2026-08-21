const dotenv = require("dotenv");
const path = require("path");

// Load .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: process.env.DB_PORT || 3306,
    NAME: process.env.DB_NAME || "grievance_portal",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || "default_jwt_secret_key_change_me_in_production_123!",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  },
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000"
};
