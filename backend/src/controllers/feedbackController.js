const { Complaint, Feedback, ComplaintStatusHistory } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params; // Complaint ID
    const { rating, comments } = req.body;
    const citizenId = req.user.userId;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return sendError(res, "Grievance ticket not found", "NOT_FOUND", 404);
    }

    // Security Check: Only the citizen who created it can review it
    if (complaint.citizen_id !== citizenId) {
      return sendError(res, "Unauthorized access to review this grievance", "ACCESS_DENIED", 403);
    }

    // Status Check: Must be resolved to submit feedback
    if (complaint.status !== "RESOLVED" && complaint.status !== "CLOSED") {
      return sendError(res, "Feedback can only be submitted for resolved grievances", "BAD_REQUEST", 400);
    }

    // Check for duplicate feedback
    const existing = await Feedback.findOne({ where: { complaint_id: id } });
    if (existing) {
      return sendError(res, "Feedback has already been submitted for this complaint", "DUPLICATE_FEEDBACK", 409);
    }

    // Create Feedback
    const feedback = await Feedback.create({
      complaint_id: id,
      citizen_id: citizenId,
      rating,
      comments,
    });

    // Automatically transition status to CLOSED upon feedback receipt
    const oldStatus = complaint.status;
    complaint.status = "CLOSED";
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint_id: id,
      old_status: oldStatus,
      new_status: "CLOSED",
      changed_by: citizenId,
      changed_by_role: "CITIZEN",
      remarks: `Citizen submitted a feedback score of ${rating}/5. Ticket officially closed.`,
    });

    return sendSuccess(res, "Feedback submitted successfully", feedback, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
};
