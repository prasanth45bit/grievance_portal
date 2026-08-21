const express = require("express");
const notificationController = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, notificationController.getNotifications);
router.patch("/:id/read", requireAuth, notificationController.markAsRead);

module.exports = router;
