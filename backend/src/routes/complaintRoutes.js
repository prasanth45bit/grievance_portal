const express = require("express");
const complaintController = require("../controllers/complaintController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { createComplaintValidator } = require("../validators/complaintValidator");
const { validateRequest } = require("../middleware/validationMiddleware");

const router = express.Router();

// Citizens lodge complaints with files
router.post(
  "/",
  requireAuth,
  requireRole("CITIZEN"),
  upload.array("images", 5), // Max 5 images
  (req, res, next) => {
    // If body contains stringified numbers, parse them for validator
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

// Detail query allowed for Citizens, Officers, and Admins (ownership enforced in controller)
router.get("/:id", requireAuth, complaintController.getComplaintDetails);

module.exports = router;
