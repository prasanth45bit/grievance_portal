const express = require("express");
const officerController = require("../controllers/officerController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("OFFICER"));

// Profile and Settings
router.get("/me", officerController.getProfile);
router.put("/me", officerController.updateProfile);
router.put("/change-password", officerController.changePassword);
router.patch("/me/duty-status", officerController.toggleDutyStatus);
router.patch("/duty-status", officerController.toggleDutyStatus);

// Dashboard Statistics
router.get("/dashboard", officerController.getDashboardStats);

// Complaints Assigned
router.get("/complaints", officerController.getAssignedComplaints);

// Work State Transitions Actions
router.patch("/complaints/:id/accept", officerController.acceptComplaint);
router.patch("/complaints/:id/start", officerController.startWork);
router.patch("/complaints/:id/hold", officerController.holdComplaint);
router.patch("/complaints/:id/escalate", officerController.escalateComplaint);
router.patch("/complaints/:id/resolve", officerController.resolveComplaint);

// Upload work resolution proof
router.post(
  "/complaints/:id/resolution-image",
  upload.single("proof"),
  officerController.uploadResolutionImage
);

module.exports = router;
