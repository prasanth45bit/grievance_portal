const express = require("express");
const citizenController = require("../controllers/citizenController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/me", requireAuth, requireRole("CITIZEN"), citizenController.getProfile);
router.put("/me", requireAuth, requireRole("CITIZEN"), citizenController.updateProfile);
router.put("/change-password", requireAuth, requireRole("CITIZEN"), citizenController.changePassword);

module.exports = router;
