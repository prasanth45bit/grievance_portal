const express = require("express");
const authController = require("../controllers/authController");
const { citizenRegisterValidator, loginValidator } = require("../validators/authValidator");
const { validateRequest } = require("../middleware/validationMiddleware");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
});

router.post(
  "/citizen/register",
  authLimiter,
  citizenRegisterValidator,
  validateRequest,
  authController.registerCitizen
);

router.post(
  "/citizen/login",
  authLimiter,
  loginValidator,
  validateRequest,
  authController.loginCitizen
);

router.post(
  "/admin/login",
  authLimiter,
  loginValidator,
  validateRequest,
  authController.loginAdmin
);

router.post(
  "/officer/login",
  authLimiter,
  loginValidator,
  validateRequest,
  authController.loginOfficer
);

module.exports = router;
