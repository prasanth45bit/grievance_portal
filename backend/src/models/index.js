const sequelize = require("../config/database");
const District = require("./District");
const Citizen = require("./Citizen");
const Department = require("./Department");
const DepartmentAdmin = require("./DepartmentAdmin");
const Officer = require("./Officer");
const Complaint = require("./Complaint");
const ComplaintImage = require("./ComplaintImage");
const ComplaintAIAnalysis = require("./ComplaintAIAnalysis");
const ComplaintStatusHistory = require("./ComplaintStatusHistory");
const Notification = require("./Notification");
const Feedback = require("./Feedback");

// ==========================================
// RELATIONSHIPS DEFINITION
// ==========================================

// District relationships
District.hasMany(Citizen, { foreignKey: "district_id", as: "citizens" });
Citizen.belongsTo(District, { foreignKey: "district_id", as: "district" });

District.hasMany(Officer, { foreignKey: "district_id", as: "officers" });
Officer.belongsTo(District, { foreignKey: "district_id", as: "district" });

District.hasMany(Complaint, { foreignKey: "district_id", as: "complaints" });
Complaint.belongsTo(District, { foreignKey: "district_id", as: "district" });

// Department relationships
Department.hasOne(DepartmentAdmin, { foreignKey: "department_id", as: "admin" });
DepartmentAdmin.belongsTo(Department, { foreignKey: "department_id", as: "department" });

Department.hasMany(Officer, { foreignKey: "department_id", as: "officers" });
Officer.belongsTo(Department, { foreignKey: "department_id", as: "department" });

Department.hasMany(Complaint, { foreignKey: "department_id", as: "complaints" });
Complaint.belongsTo(Department, { foreignKey: "department_id", as: "department" });

// Citizen relationships
Citizen.hasMany(Complaint, { foreignKey: "citizen_id", as: "complaints" });
Complaint.belongsTo(Citizen, { foreignKey: "citizen_id", as: "citizen" });

Citizen.hasMany(Feedback, { foreignKey: "citizen_id", as: "feedbacks" });
Feedback.belongsTo(Citizen, { foreignKey: "citizen_id", as: "citizen" });

// Officer relationships
Officer.hasMany(Complaint, { foreignKey: "officer_id", as: "complaints" });
Complaint.belongsTo(Officer, { foreignKey: "officer_id", as: "officer" });

// Complaint relationships
Complaint.hasMany(ComplaintImage, { foreignKey: "complaint_id", as: "images" });
ComplaintImage.belongsTo(Complaint, { foreignKey: "complaint_id", as: "complaint" });

Complaint.hasOne(ComplaintAIAnalysis, { foreignKey: "complaint_id", as: "ai_analysis" });
ComplaintAIAnalysis.belongsTo(Complaint, { foreignKey: "complaint_id", as: "complaint" });

Complaint.hasMany(ComplaintStatusHistory, { foreignKey: "complaint_id", as: "status_history" });
ComplaintStatusHistory.belongsTo(Complaint, { foreignKey: "complaint_id", as: "complaint" });

Complaint.hasOne(Feedback, { foreignKey: "complaint_id", as: "feedback" });
Feedback.belongsTo(Complaint, { foreignKey: "complaint_id", as: "complaint" });

// Expose models & connection instance
module.exports = {
  sequelize,
  District,
  Citizen,
  Department,
  DepartmentAdmin,
  Officer,
  Complaint,
  ComplaintImage,
  ComplaintAIAnalysis,
  ComplaintStatusHistory,
  Notification,
  Feedback,
};
