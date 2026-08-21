const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ComplaintAIAnalysis = sequelize.define(
  "ComplaintAIAnalysis",
  {
    analysis_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    complaint_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    predicted_department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    department_confidence: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
    },
    predicted_category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    predicted_priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: true,
    },
    ai_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ocr_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    detected_objects: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    model_version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "1.0.0",
    },
    analyzed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "complaint_ai_analysis",
    timestamps: false, // Custom analyzed_at timestamp is used
  }
);

module.exports = ComplaintAIAnalysis;
