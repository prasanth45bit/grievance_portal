const bcrypt = require("bcryptjs");
const { Citizen } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

const getProfile = async (req, res, next) => {
  try {
    const citizen = await Citizen.findByPk(req.user.userId, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!citizen) {
      return sendError(res, "Citizen profile not found", "NOT_FOUND", 404);
    }
    return sendSuccess(res, "Profile retrieved successfully", citizen);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, address, pincode, profileImage } = req.body;
    const citizen = await Citizen.findByPk(req.user.userId);
    if (!citizen) {
      return sendError(res, "Citizen profile not found", "NOT_FOUND", 404);
    }

    if (fullName) citizen.full_name = fullName;
    if (address) citizen.address = address;
    if (pincode) citizen.pincode = pincode;
    if (profileImage) citizen.profile_image = profileImage;

    await citizen.save();

    const updated = citizen.toJSON();
    delete updated.password_hash;
    return sendSuccess(res, "Profile updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return sendError(res, "Old password and new password are required", "BAD_REQUEST", 400);
    }

    const citizen = await Citizen.findByPk(req.user.userId);
    if (!citizen) {
      return sendError(res, "Citizen profile not found", "NOT_FOUND", 404);
    }

    const match = await bcrypt.compare(oldPassword, citizen.password_hash);
    if (!match) {
      return sendError(res, "Incorrect old password", "INVALID_OLD_PASSWORD", 400);
    }

    citizen.password_hash = await bcrypt.hash(newPassword, 10);
    await citizen.save();

    return sendSuccess(res, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
