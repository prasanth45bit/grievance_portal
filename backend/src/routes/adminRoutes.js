const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { createOfficerValidator, updateOfficerValidator } = require("../validators/officerValidator");
const { validateRequest } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("DEPARTMENT_ADMIN"));

// Dashboard Stats
router.get("/dashboard", adminController.getDashboardStats);

// Complaints View
router.get("/complaints", adminController.getDepartmentComplaints);

// Officer Management
router.post("/officers", createOfficerValidator, validateRequest, adminController.createOfficer);
router.get("/officers", adminController.getOfficersList);
router.get("/officers/:id", adminController.getOfficerDetails);
router.put("/officers/:id", updateOfficerValidator, validateRequest, adminController.updateOfficer);
router.patch("/officers/:id/status", adminController.updateOfficerStatus);

// Reports
router.get("/reports/overview", adminController.getOverviewReport);
router.get("/reports/districts", adminController.getDistrictReport);
router.get("/reports/officers", adminController.getOfficerReport);
router.get("/reports/trends", adminController.getTrendsReport);

module.exports = router;
