const { body } = require("express-validator");

const createComplaintValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Complaint title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Detailed description is required"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Physical location address is required")
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),
  body("districtId")
    .notEmpty()
    .withMessage("District ID is required")
    .isInt()
    .withMessage("District ID must be an integer"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

module.exports = {
  createComplaintValidator,
};
