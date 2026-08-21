const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Feedback = sequelize.define(
  "Feedback",
  {
    feedback_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    complaint_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true, // Prevent duplicate feedback for the same complaint
    },
    citizen_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "feedback",
    indexes: [
      {
        fields: ["complaint_id"],
      },
      {
        fields: ["citizen_id"],
      },
    ],
  }
);

module.exports = Feedback;
