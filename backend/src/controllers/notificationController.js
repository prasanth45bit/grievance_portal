const { Notification } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

const getNotifications = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const notifications = await Notification.findAll({
      where: { recipient_id: userId, recipient_role: role },
      order: [["created_at", "DESC"]],
    });

    return sendSuccess(res, "Notifications retrieved successfully", notifications);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const notification = await Notification.findOne({
      where: { notification_id: id, recipient_id: userId, recipient_role: role },
    });

    if (!notification) {
      return sendError(res, "Notification not found", "NOT_FOUND", 404);
    }

    notification.is_read = true;
    await notification.save();

    return sendSuccess(res, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
