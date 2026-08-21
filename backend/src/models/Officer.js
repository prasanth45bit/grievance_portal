const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Officer = sequelize.define(
  "Officer",
  {
    officer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    district_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "officers",
    indexes: [
      {
        fields: ["department_id"],
      },
      {
        fields: ["district_id"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = Officer;
