const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/environment");
const { Citizen, DepartmentAdmin, Officer } = require("../models");

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES_IN,
  });
};

const registerCitizen = async (data) => {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const citizen = await Citizen.create({
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    password_hash: passwordHash,
    address: data.address,
    district_id: data.districtId,
    pincode: data.pincode,
    profile_image: data.profileImage || null,
  });

  // Strip password
  const citizenJson = citizen.toJSON();
  delete citizenJson.password_hash;
  return citizenJson;
};

const loginCitizen = async (email, password) => {
  const citizen = await Citizen.findOne({ where: { email } });
  if (!citizen) return null;

  const match = await bcrypt.compare(password, citizen.password_hash);
  if (!match) return null;

  if (citizen.status !== "ACTIVE") {
    throw new Error("ACCOUNT_BLOCKED");
  }

  const token = generateToken({
    userId: citizen.citizen_id,
    role: "CITIZEN",
    districtId: citizen.district_id,
  });

  const citizenJson = citizen.toJSON();
  delete citizenJson.password_hash;
  return { token, user: citizenJson };
};

const loginAdmin = async (email, password) => {
  const admin = await DepartmentAdmin.findOne({ where: { email } });
  if (!admin) return null;

  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) return null;

  if (admin.status !== "ACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const token = generateToken({
    userId: admin.admin_id,
    role: "DEPARTMENT_ADMIN",
    departmentId: admin.department_id,
  });

  const adminJson = admin.toJSON();
  delete adminJson.password_hash;
  return { token, user: adminJson };
};

const loginOfficer = async (email, password) => {
  const officer = await Officer.findOne({ where: { email } });
  if (!officer) return null;

  const match = await bcrypt.compare(password, officer.password_hash);
  if (!match) return null;

  if (officer.status !== "ACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const token = generateToken({
    userId: officer.officer_id,
    role: "OFFICER",
    departmentId: officer.department_id,
    districtId: officer.district_id,
  });

  const officerJson = officer.toJSON();
  delete officerJson.password_hash;
  return { token, user: officerJson };
};

module.exports = {
  registerCitizen,
  loginCitizen,
  loginAdmin,
  loginOfficer,
  generateToken,
};
