const express = require("express");
const feedbackController = require("../controllers/feedbackController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { submitFeedbackValidator } = require("../validators/feedbackValidator");
const { validateRequest } = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/complaints/:id/feedback",
  requireAuth,
  requireRole("CITIZEN"),
  submitFeedbackValidator,
  validateRequest,
  feedbackController.submitFeedback
);

module.exports = router;
