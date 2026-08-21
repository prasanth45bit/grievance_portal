const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { sequelize, Officer, Complaint, District, Department, Feedback } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");
const logger = require("../utils/logger");

// ----------------------------------------------------
// DASHBOARD ENDPOINT
// ----------------------------------------------------
const getDashboardStats = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;

    // Total Count
    const total = await Complaint.count({ where: { department_id: deptId } });

    // Pending Count (SUBMITTED, AI_ANALYZED, ASSIGNED, ACCEPTED, IN_PROGRESS, ON_HOLD)
    const pending = await Complaint.count({
      where: {
        department_id: deptId,
        status: { [Op.in]: ["SUBMITTED", "AI_ANALYZED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "ON_HOLD"] }
      }
    });

    // Resolved Count (RESOLVED, CLOSED)
    const resolved = await Complaint.count({
      where: {
        department_id: deptId,
        status: { [Op.in]: ["RESOLVED", "CLOSED"] }
      }
    });

    // High/Critical Priority Count
    const highPriority = await Complaint.count({
      where: {
        department_id: deptId,
        priority: { [Op.in]: ["HIGH", "CRITICAL"] }
      }
    });

    // Workloads by Officer
    const officers = await Officer.findAll({
      where: { department_id: deptId },
      attributes: ["officer_id", "full_name", "designation", "status"],
      include: [
        {
          model: Complaint,
          as: "complaints",
          where: { status: { [Op.notIn]: ["RESOLVED", "CLOSED", "REJECTED"] } },
          required: false,
          attributes: ["complaint_id"]
        }
      ]
    });

    const officerWorkloads = officers.map(o => ({
      officerId: o.officer_id,
      fullName: o.full_name,
      designation: o.designation,
      status: o.status,
      activeComplaintsCount: o.complaints ? o.complaints.length : 0
    }));

    return sendSuccess(res, "Admin stats retrieved successfully", {
      metrics: {
        totalComplaints: total,
        pendingComplaints: pending,
        resolvedComplaints: resolved,
        highPriorityComplaints: highPriority,
        resolutionPercentage: total > 0 ? parseFloat(((resolved / total) * 100).toFixed(2)) : 0
      },
      officerWorkloads
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// COMPLAINTS ENDPOINTS
// ----------------------------------------------------
const getDepartmentComplaints = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { district, officer, status, priority, category, search } = req.query;

    const whereClause = { department_id: deptId };

    if (district) whereClause.district_id = district;
    if (officer) whereClause.officer_id = officer;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    if (search) {
      whereClause[Op.or] = [
        { ticket_number: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Complaint.findAndCountAll({
      where: whereClause,
      include: [
        { model: District, as: "district" },
        { model: Officer, as: "officer", attributes: ["officer_id", "full_name"] }
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      message: "Department complaints retrieved successfully",
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// OFFICERS CONFIG ENDPOINTS
// ----------------------------------------------------
const createOfficer = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const { fullName, email, phone, employeeId, designation, districtId, password } = req.body;

    logger.info("Admin creating officer with Employee ID: %s", employeeId);

    const passwordHash = await bcrypt.hash(password, 10);
    const officer = await Officer.create({
      department_id: deptId, // Enforced from admin credentials scope
      district_id: districtId,
      employee_id: employeeId,
      full_name: fullName,
      email,
      phone,
      password_hash: passwordHash,
      designation
    });

    const officerJson = officer.toJSON();
    delete officerJson.password_hash;

    return sendSuccess(res, "Officer registered successfully", officerJson, 201);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return sendError(res, "Employee ID, email or phone already exists", "OFFICER_EXISTS", 409);
    }
    next(error);
  }
};

const getOfficersList = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const officers = await Officer.findAll({
      where: { department_id: deptId },
      attributes: { exclude: ["password_hash"] },
      include: [{ model: District, as: "district" }]
    });

    return sendSuccess(res, "Officers list retrieved successfully", officers);
  } catch (error) {
    next(error);
  }
};

const getOfficerDetails = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const { id } = req.params;

    const officer = await Officer.findOne({
      where: { officer_id: id, department_id: deptId },
      attributes: { exclude: ["password_hash"] },
      include: [{ model: District, as: "district" }]
    });

    if (!officer) {
      return sendError(res, "Officer not found in your department", "NOT_FOUND", 404);
    }

    return sendSuccess(res, "Officer details retrieved", officer);
  } catch (error) {
    next(error);
  }
};

const updateOfficer = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const { id } = req.params;
    const { fullName, phone, designation, districtId, status } = req.body;

    const officer = await Officer.findOne({
      where: { officer_id: id, department_id: deptId }
    });

    if (!officer) {
      return sendError(res, "Officer not found in your department", "NOT_FOUND", 404);
    }

    if (fullName) officer.full_name = fullName;
    if (phone) officer.phone = phone;
    if (designation) officer.designation = designation;
    if (districtId) officer.district_id = districtId;
    if (status) officer.status = status;

    await officer.save();

    const officerJson = officer.toJSON();
    delete officerJson.password_hash;

    return sendSuccess(res, "Officer profile updated successfully", officerJson);
  } catch (error) {
    next(error);
  }
};

const updateOfficerStatus = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return sendError(res, "Invalid status parameter", "BAD_REQUEST", 400);
    }

    const officer = await Officer.findOne({
      where: { officer_id: id, department_id: deptId }
    });

    if (!officer) {
      return sendError(res, "Officer not found in your department", "NOT_FOUND", 404);
    }

    officer.status = status;
    await officer.save();

    return sendSuccess(res, `Officer status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// REPORTING ENDPOINTS
// ----------------------------------------------------
const getOverviewReport = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const total = await Complaint.count({ where: { department_id: deptId } });
    const resolved = await Complaint.count({ where: { department_id: deptId, status: "RESOLVED" } });
    const closed = await Complaint.count({ where: { department_id: deptId, status: "CLOSED" } });

    return sendSuccess(res, "Overview report summaries generated", {
      totalGrievances: total,
      totalResolved: resolved + closed,
      unresolved: total - (resolved + closed),
      resolutionRate: total > 0 ? parseFloat((((resolved + closed) / total) * 100).toFixed(2)) : 0
    });
  } catch (error) {
    next(error);
  }
};

const getDistrictReport = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const stats = await Complaint.findAll({
      where: { department_id: deptId },
      attributes: [
        "district_id",
        [sequelize.fn("COUNT", sequelize.col("complaint_id")), "complaintsCount"]
      ],
      include: [{ model: District, as: "district", attributes: ["district_name"] }],
      group: ["district_id", "district.district_id"]
    });

    return sendSuccess(res, "District wise complaints metrics generated", stats);
  } catch (error) {
    next(error);
  }
};

const getOfficerReport = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    const stats = await Officer.findAll({
      where: { department_id: deptId },
      attributes: ["officer_id", "full_name", "designation"],
      include: [
        {
          model: Complaint,
          as: "complaints",
          attributes: ["status"]
        }
      ]
    });

    const report = stats.map(off => {
      const tickets = off.complaints || [];
      const resolved = tickets.filter(t => ["RESOLVED", "CLOSED"].includes(t.status)).length;
      return {
        officerId: off.officer_id,
        fullName: off.full_name,
        designation: off.designation,
        totalAssigned: tickets.length,
        resolvedCount: resolved,
        pendingCount: tickets.length - resolved
      };
    });

    return sendSuccess(res, "Officer performance reports generated", report);
  } catch (error) {
    next(error);
  }
};

const getTrendsReport = async (req, res, next) => {
  try {
    const deptId = req.user.departmentId;
    // Group count by month-year
    const stats = await Complaint.findAll({
      where: { department_id: deptId },
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"), "month"],
        [sequelize.fn("COUNT", sequelize.col("complaint_id")), "count"]
      ],
      group: ["month"],
      order: [[sequelize.literal("month"), "ASC"]]
    });

    return sendSuccess(res, "Monthly trend metrics generated", stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDepartmentComplaints,
  createOfficer,
  getOfficersList,
  getOfficerDetails,
  updateOfficer,
  updateOfficerStatus,
  getOverviewReport,
  getDistrictReport,
  getOfficerReport,
  getTrendsReport
};
