const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Citizen = sequelize.define(
  "Citizen",
  {
    citizen_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    district_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(10),
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
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "BLOCKED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "citizens",
    indexes: [
      {
        fields: ["district_id"],
      },
    ],
  }
);

module.exports = Citizen;
