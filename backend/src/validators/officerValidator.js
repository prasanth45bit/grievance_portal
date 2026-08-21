const { body } = require("express-validator");

const createOfficerValidator = [
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
    .withMessage("Must be a valid email address"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits"),
  body("employeeId")
    .trim()
    .notEmpty()
    .withMessage("Employee ID is required")
    .isLength({ max: 50 })
    .withMessage("Employee ID cannot exceed 50 characters"),
  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation description is required")
    .isLength({ max: 100 })
    .withMessage("Designation cannot exceed 100 characters"),
  body("districtId")
    .notEmpty()
    .withMessage("District ID mapping is required")
    .isInt()
    .withMessage("District ID must be an integer"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const updateOfficerValidator = [
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .isLength({ max: 100 }),
  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone number cannot be empty")
    .isLength({ min: 10, max: 15 }),
  body("designation")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Designation cannot be empty")
    .isLength({ max: 100 }),
  body("districtId")
    .optional()
    .isInt()
    .withMessage("District ID must be an integer"),
];

module.exports = {
  createOfficerValidator,
  updateOfficerValidator,
};
