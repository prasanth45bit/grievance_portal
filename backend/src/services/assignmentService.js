const { Op } = require("sequelize");
const { Officer, Complaint } = require("../models");
const logger = require("../utils/logger");

const assignOfficer = async (departmentId, districtId) => {
  logger.info(
    "Running auto-assignment routine for Department ID: %s, District ID: %s",
    departmentId,
    districtId
  );

  // 1. Fetch all active officers in the specific department and district
  const officers = await Officer.findAll({
    where: {
      department_id: departmentId,
      district_id: districtId,
      status: "ACTIVE",
    },
  });

  if (officers.length === 0) {
    logger.warn(
      "No active officers found for Department ID: %s and District ID: %s. Leaving unassigned.",
      departmentId,
      districtId
    );
    return null; // Unassigned
  }

  // 2. Count active workloads for these officers
  // Active status criteria: status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')
  const officerIds = officers.map((o) => o.officer_id);
  const activeComplaints = await Complaint.findAll({
    where: {
      officer_id: {
        [Op.in]: officerIds,
      },
      status: {
        [Op.notIn]: ["RESOLVED", "CLOSED", "REJECTED"],
      },
    },
  });

  // Calculate workloads
  const workloadMap = {};
  officerIds.forEach((id) => {
    workloadMap[id] = 0;
  });

  activeComplaints.forEach((comp) => {
    if (workloadMap[comp.officer_id] !== undefined) {
      workloadMap[comp.officer_id]++;
    }
  });

  // 3. Find the officer with the minimum workload
  let assignedOfficerId = null;
  let minWorkload = Infinity;

  officers.forEach((off) => {
    const workload = workloadMap[off.officer_id];
    if (workload < minWorkload) {
      minWorkload = workload;
      assignedOfficerId = off.officer_id;
    }
  });

  logger.info(
    "Assigned Officer ID: %s with workload count: %s",
    assignedOfficerId,
    minWorkload
  );
  return assignedOfficerId;
};

module.exports = {
  assignOfficer,
};
