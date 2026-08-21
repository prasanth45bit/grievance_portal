const authService = require("../services/authService");
const { sendSuccess, sendError } = require("../utils/response");
const logger = require("../utils/logger");

const registerCitizen = async (req, res, next) => {
  try {
    logger.info("Handling citizen registration request: %s", req.body.email);
    const citizen = await authService.registerCitizen(req.body);
    return sendSuccess(res, "Citizen registered successfully", citizen, 201);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return sendError(res, "Email or phone number already exists", "EMAIL_OR_PHONE_EXISTS", 409);
    }
    next(error);
  }
};

const loginCitizen = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginCitizen(email, password);
    if (!result) {
      return sendError(res, "Invalid email address or password", "INVALID_CREDENTIALS", 401);
    }
    return sendSuccess(res, "Citizen logged in successfully", result);
  } catch (error) {
    if (error.message === "ACCOUNT_BLOCKED") {
      return sendError(res, "Your account has been blocked by administrator", "ACCOUNT_BLOCKED", 403);
    }
    next(error);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);
    if (!result) {
      return sendError(res, "Invalid admin email or password", "INVALID_CREDENTIALS", 401);
    }
    return sendSuccess(res, "Department Admin logged in successfully", result);
  } catch (error) {
    if (error.message === "ACCOUNT_INACTIVE") {
      return sendError(res, "Your administrator account is inactive", "ACCOUNT_INACTIVE", 403);
    }
    next(error);
  }
};

const loginOfficer = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginOfficer(email, password);
    if (!result) {
      return sendError(res, "Invalid officer email or password", "INVALID_CREDENTIALS", 401);
    }
    return sendSuccess(res, "Officer logged in successfully", result);
  } catch (error) {
    if (error.message === "ACCOUNT_INACTIVE") {
      return sendError(res, "Your officer account is currently inactive", "ACCOUNT_INACTIVE", 403);
    }
    next(error);
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  loginAdmin,
  loginOfficer,
};
