const { Op } = require("sequelize");
const { Complaint, ComplaintImage, ComplaintAIAnalysis, ComplaintStatusHistory, Feedback, Department, District } = require("../models");
const complaintService = require("../services/complaintService");
const { sendSuccess, sendError } = require("../utils/response");
const logger = require("../utils/logger");

const createComplaint = async (req, res, next) => {
  try {
    logger.info("Controller request to submit new complaint");
    const complaint = await complaintService.createComplaint(
      req.user.userId,
      req.body,
      req.files
    );
    return sendSuccess(res, "Grievance submitted successfully", complaint, 201);
  } catch (error) {
    next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const sort = req.query.sort || "created_at";
    const sortOrder = req.query.sortOrder || "DESC";

    const whereClause = {
      citizen_id: req.user.userId,
    };

    if (search) {
      whereClause[Op.or] = [
        { ticket_number: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Complaint.findAndCountAll({
      where: whereClause,
      include: [
        { model: Department, as: "department" },
        { model: District, as: "district" },
      ],
      limit,
      offset,
      order: [[sort, sortOrder]],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Personal complaints retrieved successfully",
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getComplaintDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByPk(id, {
      include: [
        { model: ComplaintImage, as: "images" },
        { model: ComplaintAIAnalysis, as: "ai_analysis" },
        { model: ComplaintStatusHistory, as: "status_history" },
        { model: Feedback, as: "feedback" },
        { model: Department, as: "department" },
        { model: District, as: "district" },
      ],
    });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    // Role-based security checks
    if (req.user.role === "CITIZEN" && complaint.citizen_id !== req.user.userId) {
      return sendError(res, "Unauthorized access to this grievance", "ACCESS_DENIED", 403);
    }

    if (req.user.role === "OFFICER") {
      // Must match officer's department AND district
      if (
        complaint.department_id !== req.user.departmentId ||
        complaint.district_id !== req.user.districtId
      ) {
        return sendError(res, "Unauthorized access to this district's grievance", "ACCESS_DENIED", 403);
      }
    }

    if (req.user.role === "DEPARTMENT_ADMIN") {
      // Must match admin's department
      if (complaint.department_id !== req.user.departmentId) {
        return sendError(res, "Unauthorized access to this department's grievance", "ACCESS_DENIED", 403);
      }
    }

    return sendSuccess(res, "Complaint details retrieved successfully", complaint);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintDetails,
};
