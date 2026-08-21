const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Complaint = sequelize.define(
  "Complaint",
  {
    complaint_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ticket_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    citizen_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true, // Can be null initially before AI classification
    },
    district_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    officer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true, // Can be null if no officer matches or prior to auto-assignment
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: false,
      defaultValue: "LOW",
    },
    status: {
      type: DataTypes.ENUM(
        "SUBMITTED",
        "AI_ANALYZED",
        "ASSIGNED",
        "ACCEPTED",
        "IN_PROGRESS",
        "ON_HOLD",
        "ESCALATED",
        "RESOLVED",
        "CLOSED",
        "REJECTED",
        "REOPENED"
      ),
      allowNull: false,
      defaultValue: "SUBMITTED",
    },
  },
  {
    tableName: "complaints",
    indexes: [
      {
        fields: ["citizen_id"],
      },
      {
        fields: ["department_id"],
      },
      {
        fields: ["district_id"],
      },
      {
        fields: ["officer_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["priority"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = Complaint;
