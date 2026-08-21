const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    notification_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    recipient_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    recipient_role: {
      type: DataTypes.ENUM("CITIZEN", "OFFICER", "DEPARTMENT_ADMIN"),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "notifications",
    indexes: [
      {
        fields: ["recipient_id", "recipient_role"],
      },
      {
        fields: ["is_read"],
      },
    ],
  }
);

module.exports = Notification;
