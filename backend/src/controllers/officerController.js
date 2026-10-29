const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { Complaint, ComplaintImage, ComplaintStatusHistory, Citizen, DepartmentAdmin, Officer, Department, District } = require("../models");
const notificationService = require("../services/notificationService");
const { sendSuccess, sendError } = require("../utils/response");
const logger = require("../utils/logger");

// ----------------------------------------------------
// DASHBOARD ENDPOINT
// ----------------------------------------------------
const getDashboardStats = async (req, res, next) => {
  try {
    const { departmentId, districtId, userId } = req.user;

    // Total Assigned to this Officer/Region
    const assigned = await Complaint.count({
      where: { department_id: departmentId, district_id: districtId, officer_id: userId }
    });

    const pending = await Complaint.count({
      where: {
        department_id: departmentId,
        district_id: districtId,
        officer_id: userId,
        status: { [Op.in]: ["ASSIGNED", "ACCEPTED"] }
      }
    });

    const inProgress = await Complaint.count({
      where: {
        department_id: departmentId,
        district_id: districtId,
        officer_id: userId,
        status: "IN_PROGRESS"
      }
    });

    const resolved = await Complaint.count({
      where: {
        department_id: departmentId,
        district_id: districtId,
        officer_id: userId,
        status: { [Op.in]: ["RESOLVED", "CLOSED"] }
      }
    });

    const highPriority = await Complaint.count({
      where: {
        department_id: departmentId,
        district_id: districtId,
        officer_id: userId,
        priority: { [Op.in]: ["HIGH", "CRITICAL"] }
      }
    });

    return sendSuccess(res, "Officer metrics retrieved successfully", {
      assignedCount: assigned,
      pendingCount: pending,
      inProgressCount: inProgress,
      resolvedCount: resolved,
      highPriorityCount: highPriority,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// LIST / DETAIL ENDPOINTS
// ----------------------------------------------------
const getAssignedComplaints = async (req, res, next) => {
  try {
    const { departmentId, districtId, userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { status, priority } = req.query;

    const whereClause = {
      department_id: departmentId,
      district_id: districtId,
      officer_id: userId,
    };

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const { count, rows } = await Complaint.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Assigned complaints list retrieved",
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// STATE TRANSITIONS ACTIONS
// ----------------------------------------------------
const updateStatus = async (complaintId, oldStatus, newStatus, officerId, remarks) => {
  const complaint = await Complaint.findByPk(complaintId);
  complaint.status = newStatus;
  await complaint.save();

  // Write Status History
  await ComplaintStatusHistory.create({
    complaint_id: complaintId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: officerId,
    changed_by_role: "OFFICER",
    remarks,
  });

  return complaint;
};

const acceptComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, districtId, userId } = req.user;

    const complaint = await Complaint.findOne({
      where: { complaint_id: id, department_id: departmentId, district_id: districtId, officer_id: userId }
    });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found or unassigned", "NOT_FOUND", 404);
    }

    if (complaint.status !== "ASSIGNED" && complaint.status !== "SUBMITTED") {
      return sendError(res, "Cannot accept complaint from its current status", "BAD_REQUEST", 400);
    }

    await updateStatus(id, complaint.status, "ACCEPTED", userId, "Nodal officer accepted work routing.");

    // Notify citizen
    await notificationService.notifyCitizen(
      complaint.citizen_id,
      "Grievance Accepted",
      `Nodal officer has accepted your grievance ${complaint.ticket_number}.`
    );

    return sendSuccess(res, "Complaint accepted successfully");
  } catch (error) {
    next(error);
  }
};

const startWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, districtId, userId } = req.user;

    const complaint = await Complaint.findOne({
      where: { complaint_id: id, department_id: departmentId, district_id: districtId, officer_id: userId }
    });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    if (complaint.status !== "ACCEPTED") {
      return sendError(res, "Grievance must be accepted before starting work", "BAD_REQUEST", 400);
    }

    await updateStatus(id, "ACCEPTED", "IN_PROGRESS", userId, "Physical maintenance inspection in progress.");

    // Notify citizen
    await notificationService.notifyCitizen(
      complaint.citizen_id,
      "Work Started",
      `Work progress started on your grievance ticket ${complaint.ticket_number}.`
    );

    return sendSuccess(res, "Work status changed to in-progress");
  } catch (error) {
    next(error);
  }
};

const holdComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const { departmentId, districtId, userId } = req.user;

    const complaint = await Complaint.findOne({
      where: { complaint_id: id, department_id: departmentId, district_id: districtId, officer_id: userId }
    });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    await updateStatus(id, complaint.status, "ON_HOLD", userId, remarks || "Placed on hold pending material approvals.");

    return sendSuccess(res, "Grievance placed on hold");
  } catch (error) {
    next(error);
  }
};

const escalateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const { departmentId, districtId, userId } = req.user;

    const complaint = await Complaint.findOne({
      where: { complaint_id: id, department_id: departmentId, district_id: districtId, officer_id: userId }
    });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    await updateStatus(id, complaint.status, "ESCALATED", userId, remarks || "Escalating workload/material limits.");

    // Notify admin
    const admin = await DepartmentAdmin.findOne({ where: { department_id: departmentId, status: "ACTIVE" } });
    if (admin) {
      await notificationService.notifyAdmin(
        admin.admin_id,
        "Grievance Escalation Alert",
        `Officer has escalated complaint ${complaint.ticket_number}. Remarks: ${remarks}`
      );
    }

    return sendSuccess(res, "Complaint escalated to Department Admin");
  } catch (error) {
    next(error);
  }
};

const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const { departmentId, districtId, userId } = req.user;

    const complaint = await Complaint.findOne({
      where: { complaint_id: id, department_id: departmentId, district_id: districtId, officer_id: userId }
    });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    await updateStatus(id, complaint.status, "RESOLVED", userId, remarks || "Maintenance patching completed.");

    // Notify citizen
    await notificationService.notifyCitizen(
      complaint.citizen_id,
      "Grievance Resolved",
      `Your grievance ${complaint.ticket_number} has been marked resolved. Please submit feedback.`
    );

    return sendSuccess(res, "Complaint resolved successfully");
  } catch (error) {
    next(error);
  }
};

// Upload resolution photo proof
const uploadResolutionImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, districtId, userId } = req.user;

    const complaint = await Complaint.findOne({
      where: { complaint_id: id, department_id: departmentId, district_id: districtId, officer_id: userId }
    });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    if (!req.file) {
      return sendError(res, "Resolution image proof file is required", "BAD_REQUEST", 400);
    }

    const image = await ComplaintImage.create({
      complaint_id: id,
      image_url: `/uploads/${req.file.filename}`,
      file_name: req.file.filename,
      file_type: req.file.mimetype,
      file_size: req.file.size
    });

    return sendSuccess(res, "Resolution image uploaded successfully", image);
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// OFFICER PROFILE & ACCOUNT SETTINGS
// ----------------------------------------------------
const getProfile = async (req, res, next) => {
  try {
    const officer = await Officer.findByPk(req.user.userId, {
      attributes: { exclude: ["password_hash"] },
      include: [
        { model: Department, as: "department", attributes: ["department_id", "department_name", "description"] },
        { model: District, as: "district", attributes: ["district_id", "district_name", "state_name"] },
      ],
    });

    if (!officer) {
      return sendError(res, "Officer profile not found", "NOT_FOUND", 404);
    }

    const resolvedCount = await Complaint.count({
      where: {
        officer_id: req.user.userId,
        status: { [Op.in]: ["RESOLVED", "CLOSED"] },
      },
    });

    const activeCount = await Complaint.count({
      where: {
        officer_id: req.user.userId,
        status: { [Op.in]: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "ON_HOLD", "ESCALATED"] },
      },
    });

    const officerData = officer.toJSON();
    officerData.metrics = {
      totalResolved: resolvedCount,
      activeComplaints: activeCount,
    };

    return sendSuccess(res, "Officer profile retrieved successfully", officerData);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, designation, profileImage } = req.body;
    const officer = await Officer.findByPk(req.user.userId);

    if (!officer) {
      return sendError(res, "Officer profile not found", "NOT_FOUND", 404);
    }

    if (fullName) officer.full_name = fullName;
    if (phone) officer.phone = phone;
    if (designation) officer.designation = designation;
    if (profileImage !== undefined) officer.profile_image = profileImage;

    await officer.save();

    const officerJson = officer.toJSON();
    delete officerJson.password_hash;

    return sendSuccess(res, "Officer profile updated successfully", officerJson);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, oldPassword, newPassword } = req.body;
    const pwdToCheck = oldPassword || currentPassword;

    if (!pwdToCheck || !newPassword) {
      return sendError(res, "Current password and new password are required", "BAD_REQUEST", 400);
    }

    const officer = await Officer.findByPk(req.user.userId);
    if (!officer) {
      return sendError(res, "Officer profile not found", "NOT_FOUND", 404);
    }

    const match = await bcrypt.compare(pwdToCheck, officer.password_hash);
    if (!match) {
      return sendError(res, "Incorrect current password", "INVALID_OLD_PASSWORD", 400);
    }

    officer.password_hash = await bcrypt.hash(newPassword, 10);
    await officer.save();

    return sendSuccess(res, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};

const toggleDutyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const officer = await Officer.findByPk(req.user.userId);

    if (!officer) {
      return sendError(res, "Officer not found", "NOT_FOUND", 404);
    }

    if (status) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return sendError(res, "Status must be ACTIVE or INACTIVE", "BAD_REQUEST", 400);
      }
      officer.status = status;
    } else {
      officer.status = officer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    }

    await officer.save();

    return sendSuccess(res, `Duty status updated to ${officer.status}`, {
      status: officer.status,
      isActive: officer.status === "ACTIVE",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAssignedComplaints,
  acceptComplaint,
  startWork,
  holdComplaint,
  escalateComplaint,
  resolveComplaint,
  uploadResolutionImage,
  getProfile,
  updateProfile,
  changePassword,
  toggleDutyStatus,
};
