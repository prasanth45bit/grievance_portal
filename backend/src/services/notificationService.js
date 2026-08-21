const { Notification } = require("../models");
const logger = require("../utils/logger");

const createNotification = async (recipientId, recipientRole, title, message) => {
  try {
    const notification = await Notification.create({
      recipient_id: recipientId,
      recipient_role: recipientRole,
      title,
      message,
    });
    logger.info(
      "Notification created for recipient ID: %s (%s) - %s",
      recipientId,
      recipientRole,
      title
    );
    return notification;
  } catch (error) {
    logger.error("Failed to create notification: %s", error.message);
  }
};

const notifyCitizen = async (citizenId, title, message) => {
  return createNotification(citizenId, "CITIZEN", title, message);
};

const notifyOfficer = async (officerId, title, message) => {
  return createNotification(officerId, "OFFICER", title, message);
};

const notifyAdmin = async (adminId, title, message) => {
  return createNotification(adminId, "DEPARTMENT_ADMIN", title, message);
};

module.exports = {
  createNotification,
  notifyCitizen,
  notifyOfficer,
  notifyAdmin,
};
