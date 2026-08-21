const { body } = require("express-validator");

const citizenRegisterValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: 100 })
    .withMessage("Full name cannot exceed 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Postal address is required")
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),
  body("districtId")
    .notEmpty()
    .withMessage("District ID is required")
    .isInt()
    .withMessage("District ID must be an integer"),
  body("pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .isLength({ min: 6, max: 10 })
    .withMessage("Pincode must be between 6 and 10 characters"),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = {
  citizenRegisterValidator,
  loginValidator,
};
