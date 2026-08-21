const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ComplaintStatusHistory = sequelize.define(
  "ComplaintStatusHistory",
  {
    history_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    complaint_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    old_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    changed_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false, // Refers to user/officer/admin ID
    },
    changed_by_role: {
      type: DataTypes.ENUM("CITIZEN", "DEPARTMENT_ADMIN", "OFFICER", "SYSTEM"),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "complaint_status_history",
    updatedAt: false, // Only created_at is needed
  }
);

module.exports = ComplaintStatusHistory;
