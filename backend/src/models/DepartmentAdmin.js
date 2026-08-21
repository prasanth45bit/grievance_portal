const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DepartmentAdmin = sequelize.define(
  "DepartmentAdmin",
  {
    admin_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true, // Enforce one admin per department
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "department_admins",
    indexes: [
      {
        fields: ["department_id"],
      },
    ],
  }
);

module.exports = DepartmentAdmin;
