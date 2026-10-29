const { District, Department } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

const getDistricts = async (req, res, next) => {
  try {
    const districts = await District.findAll({
      where: { status: "ACTIVE" },
      order: [["district_name", "ASC"]],
      attributes: ["district_id", "district_name", "state_name", "status"],
    });
    return sendSuccess(res, "Districts retrieved successfully", districts);
  } catch (error) {
    next(error);
  }
};

const getDistrictById = async (req, res, next) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (!district) {
      return sendError(res, "District not found", "NOT_FOUND", 404);
    }
    return sendSuccess(res, "District retrieved successfully", district);
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      where: { status: "ACTIVE" },
      order: [["department_name", "ASC"]],
      attributes: ["department_id", "department_name", "description", "status"],
    });
    return sendSuccess(res, "Departments retrieved successfully", departments);
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return sendError(res, "Department not found", "NOT_FOUND", 404);
    }
    return sendSuccess(res, "Department retrieved successfully", department);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDistricts,
  getDistrictById,
  getDepartments,
  getDepartmentById,
};
