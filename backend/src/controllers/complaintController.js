const { Op } = require("sequelize");
const { Complaint, ComplaintImage, ComplaintAIAnalysis, ComplaintStatusHistory, Feedback, Department, District, Officer } = require("../models");
const complaintService = require("../services/complaintService");
const aiService = require("../services/aiService");
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
        { model: Officer, as: "officer", attributes: ["officer_id", "full_name", "designation", "phone"] },
        { model: ComplaintAIAnalysis, as: "ai_analysis" },
        { model: ComplaintImage, as: "images" },
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
    const isNumeric = /^\d+$/.test(id);

    const queryOptions = {
      include: [
        { model: ComplaintImage, as: "images" },
        { model: ComplaintAIAnalysis, as: "ai_analysis" },
        { model: ComplaintStatusHistory, as: "status_history" },
        { model: Feedback, as: "feedback" },
        { model: Department, as: "department" },
        { model: District, as: "district" },
        { model: Officer, as: "officer", attributes: ["officer_id", "full_name", "designation", "phone", "email"] },
      ],
    };

    const complaint = isNumeric
      ? await Complaint.findByPk(id, queryOptions)
      : await Complaint.findOne({ where: { ticket_number: id }, ...queryOptions });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    // Role-based security checks
    if (req.user.role === "CITIZEN" && complaint.citizen_id !== req.user.userId) {
      return sendError(res, "Unauthorized access to this grievance", "ACCESS_DENIED", 403);
    }

    if (req.user.role === "OFFICER") {
      if (
        complaint.department_id !== req.user.departmentId ||
        complaint.district_id !== req.user.districtId
      ) {
        return sendError(res, "Unauthorized access to this district's grievance", "ACCESS_DENIED", 403);
      }
    }

    if (req.user.role === "DEPARTMENT_ADMIN") {
      if (complaint.department_id !== req.user.departmentId) {
        return sendError(res, "Unauthorized access to this department's grievance", "ACCESS_DENIED", 403);
      }
    }

    return sendSuccess(res, "Complaint details retrieved successfully", complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * Public Grievance Tracking by Ticket Number (No Authentication required)
 */
const trackComplaint = async (req, res, next) => {
  try {
    const { ticketNumber } = req.params;
    const complaint = await Complaint.findOne({
      where: { ticket_number: ticketNumber },
      include: [
        { model: Department, as: "department", attributes: ["department_id", "department_name", "description"] },
        { model: District, as: "district", attributes: ["district_id", "district_name"] },
        { model: ComplaintStatusHistory, as: "status_history" },
        { model: ComplaintAIAnalysis, as: "ai_analysis" },
        { model: ComplaintImage, as: "images" },
        { model: Officer, as: "officer", attributes: ["full_name", "designation"] },
      ],
    });

    if (!complaint) {
      return sendError(res, `Grievance ticket '${ticketNumber}' not found. Please verify the ticket number.`, "NOT_FOUND", 404);
    }

    return sendSuccess(res, "Grievance tracking information retrieved", complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * Citizen can withdraw a submitted complaint
 */
const withdrawComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const isNumeric = /^\d+$/.test(id);

    const complaint = isNumeric
      ? await Complaint.findByPk(id)
      : await Complaint.findOne({ where: { ticket_number: id } });

    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    if (complaint.citizen_id !== req.user.userId) {
      return sendError(res, "Unauthorized to withdraw this grievance", "ACCESS_DENIED", 403);
    }

    if (["RESOLVED", "CLOSED", "REJECTED"].includes(complaint.status)) {
      return sendError(res, `Cannot withdraw grievance that is already marked ${complaint.status}`, "BAD_REQUEST", 400);
    }

    const previousStatus = complaint.status;
    complaint.status = "CLOSED";
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint_id: complaint.complaint_id,
      old_status: previousStatus,
      new_status: "CLOSED",
      changed_by: req.user.userId,
      changed_by_role: "CITIZEN",
      remarks: remarks || "Complaint withdrawn by citizen.",
    });

    return sendSuccess(res, "Grievance withdrawn successfully", complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * Live Image Pre-Inspection via AI vision service
 */
const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "No image file provided for visual analysis", "BAD_REQUEST", 400);
    }

    const aiResults = await aiService.callImageDetector(req.file);
    if (!aiResults) {
      return sendError(res, "Image detection service was unreachable", "AI_UNAVAILABLE", 503);
    }

    return sendSuccess(res, "Image visual analysis completed", aiResults);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintDetails,
  trackComplaint,
  withdrawComplaint,
  analyzeImage,
};
