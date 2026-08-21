const { body } = require("express-validator");

const submitFeedbackValidator = [
  body("rating")
    .notEmpty()
    .withMessage("Rating score is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("comments")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comments cannot exceed 1000 characters"),
];

module.exports = {
  submitFeedbackValidator,
};
