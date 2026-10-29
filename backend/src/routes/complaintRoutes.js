const express = require("express");
const complaintController = require("../controllers/complaintController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { createComplaintValidator } = require("../validators/complaintValidator");
const { validateRequest } = require("../middleware/validationMiddleware");

const router = express.Router();

// Public route to track grievance status by ticket number
router.get("/track/:ticketNumber", complaintController.trackComplaint);

// Real-time AI image inspection
router.post(
  "/analyze-image",
  upload.single("image"),
  complaintController.analyzeImage
);

// Citizens lodge complaints with files
router.post(
  "/",
  requireAuth,
  requireRole("CITIZEN"),
  upload.array("images", 5), // Max 5 images
  (req, res, next) => {
    if (req.body.districtId) req.body.districtId = parseInt(req.body.districtId);
    if (req.body.latitude) req.body.latitude = parseFloat(req.body.latitude);
    if (req.body.longitude) req.body.longitude = parseFloat(req.body.longitude);
    next();
  },
  createComplaintValidator,
  validateRequest,
  complaintController.createComplaint
);

// Citizens track their own complaints
router.get("/my", requireAuth, requireRole("CITIZEN"), complaintController.getMyComplaints);

// Citizens withdraw a pending complaint
router.patch("/:id/withdraw", requireAuth, requireRole("CITIZEN"), complaintController.withdrawComplaint);

// Detail query allowed for Citizens, Officers, and Admins (ownership enforced in controller)
router.get("/:id", requireAuth, complaintController.getComplaintDetails);

module.exports = router;
