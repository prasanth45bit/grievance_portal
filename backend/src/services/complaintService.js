const { sequelize, Complaint, ComplaintImage, ComplaintAIAnalysis, ComplaintStatusHistory, DepartmentAdmin } = require("../models");
const aiService = require("./aiService");
const assignmentService = require("./assignmentService");
const notificationService = require("./notificationService");
const generateTicketNumber = require("../utils/generateTicketNumber");
const logger = require("../utils/logger");

const createComplaint = async (citizenId, data, files = []) => {
  logger.info("Initializing complaint creation service for citizen: %s", citizenId);

  // 1. Run AI analysis outside the DB transaction to avoid locking tables
  const fileUrls = files.map(file => `/uploads/${file.filename}`);
  let aiResults = null;
  try {
    aiResults = await aiService.predictGrievance(data.description, fileUrls);
  } catch (error) {
    logger.error("AI service prediction failed: %s. Using fallback prediction.", error.message);
    aiResults = {
      predictedDepartmentId: null,
      departmentConfidence: 0.0,
      predictedCategory: "General Help",
      predictedPriority: "LOW",
      aiSummary: "AI analysis failed. Fallback default categorization applied.",
      ocrText: "",
      detectedObjects: []
    };
  }

  // 2. Start MySQL transaction
  const tx = await sequelize.transaction();

  try {
    const ticketNumber = generateTicketNumber();

    // Create main complaint record
    const complaint = await Complaint.create(
      {
        ticket_number: ticketNumber,
        citizen_id: citizenId,
        department_id: aiResults.predictedDepartmentId,
        district_id: data.districtId,
        title: data.title,
        description: data.description,
        address: data.address,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        priority: aiResults.predictedPriority,
        status: "SUBMITTED"
      },
      { transaction: tx }
    );

    // Save uploaded image paths
    if (files.length > 0) {
      const imageRecords = files.map(file => ({
        complaint_id: complaint.complaint_id,
        image_url: `/uploads/${file.filename}`,
        file_name: file.filename,
        file_type: file.mimetype,
        file_size: file.size
      }));
      await ComplaintImage.bulkCreate(imageRecords, { transaction: tx });
    }

    // Save AI classification result
    await ComplaintAIAnalysis.create(
      {
        complaint_id: complaint.complaint_id,
        predicted_department_id: aiResults.predictedDepartmentId,
        department_confidence: aiResults.departmentConfidence,
        predicted_category: aiResults.predictedCategory,
        predicted_priority: aiResults.predictedPriority,
        ai_summary: aiResults.aiSummary,
        ocr_text: aiResults.ocrText,
        detected_objects: aiResults.detectedObjects
      },
      { transaction: tx }
    );

    // Create initial status history entry
    await ComplaintStatusHistory.create(
      {
        complaint_id: complaint.complaint_id,
        old_status: null,
        new_status: "SUBMITTED",
        changed_by: citizenId,
        changed_by_role: "CITIZEN",
        remarks: "Grievance lodged successfully."
      },
      { transaction: tx }
    );

    // 3. Assign Nodal Officer dynamically based on workload/district constraints
    let assignedOfficerId = null;
    if (aiResults.predictedDepartmentId) {
      assignedOfficerId = await assignmentService.assignOfficer(
        aiResults.predictedDepartmentId,
        data.districtId
      );
    }

    if (assignedOfficerId) {
      // Update complaint status & assigned officer
      complaint.officer_id = assignedOfficerId;
      complaint.status = "ASSIGNED";
      await complaint.save({ transaction: tx });

      // Add status change audit log
      await ComplaintStatusHistory.create(
        {
          complaint_id: complaint.complaint_id,
          old_status: "SUBMITTED",
          new_status: "ASSIGNED",
          changed_by: citizenId,
          changed_by_role: "SYSTEM",
          remarks: `Grievance auto-routed to regional officer ID: ${assignedOfficerId}.`
        },
        { transaction: tx }
      );

      // Notify citizen and officer
      await notificationService.notifyCitizen(
        citizenId,
        "Complaint Assigned",
        `Your grievance ${ticketNumber} has been auto-assigned to regional nodal officer.`
      );
      await notificationService.notifyOfficer(
        assignedOfficerId,
        "New Work Assignment",
        `A new grievance ticket ${ticketNumber} has been assigned to your active queue.`
      );
    } else {
      // Keep unassigned, notify department admin
      logger.warn("Leaving complaint %s unassigned - no active officers matched.", ticketNumber);
      
      // Fetch department admin to notify
      if (aiResults.predictedDepartmentId) {
        const deptAdmin = await DepartmentAdmin.findOne({
          where: { department_id: aiResults.predictedDepartmentId, status: "ACTIVE" }
        });
        if (deptAdmin) {
          await notificationService.notifyAdmin(
            deptAdmin.admin_id,
            "Unassigned Grievance Alert",
            `Ticket ${ticketNumber} remains unassigned due to unavailability of active regional officers.`
          );
        }
      }

      await notificationService.notifyCitizen(
        citizenId,
        "Complaint Lodged",
        `Your grievance ${ticketNumber} has been submitted successfully and is pending routing.`
      );
    }

    // Commit Transaction
    await tx.commit();
    logger.info("Complaint %s registered and committed successfully.", ticketNumber);
    return complaint;
  } catch (error) {
    // Rollback on any failure
    await tx.rollback();
    logger.error("Failed to lodge complaint: %s", error.message);
    throw error;
  }
};

module.exports = {
  createComplaint,
};
