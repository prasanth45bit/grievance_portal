const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ComplaintImage = sequelize.define(
  "ComplaintImage",
  {
    image_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    complaint_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "complaint_images",
    updatedAt: false, // Only created_at is needed
  }
);

module.exports = ComplaintImage;
