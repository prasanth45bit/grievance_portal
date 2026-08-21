const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const District = sequelize.define(
  "District",
  {
    district_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    district_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "uk_district_name_state",
    },
    state_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Tamil Nadu",
      unique: "uk_district_name_state",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "districts",
    indexes: [
      {
        unique: true,
        fields: ["district_name", "state_name"],
      },
    ],
  }
);

module.exports = District;
