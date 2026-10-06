const bcrypt = require("bcryptjs");

const {
  District,
  Department,
  DepartmentAdmin,
  Officer,
  Citizen,
  Complaint,
  ComplaintAIAnalysis,
  ComplaintStatusHistory,
} = require("../models");

const logger = require("../utils/logger");

const seedDatabase = async () => {
  try {
    logger.info("Initializing database seeding...");

    // ============================================================
    // 1. Seed Tamil Nadu Districts
    // ============================================================

    const tnDistricts = [
      "Ariyalur",
      "Chengalpattu",
      "Chennai",
      "Coimbatore",
      "Cuddalore",
      "Dharmapuri",
      "Dindigul",
      "Erode",
      "Kallakurichi",
      "Kanchipuram",
      "Kanyakumari",
      "Karur",
      "Krishnagiri",
      "Madurai",
      "Mayiladuthurai",
      "Nagapattinam",
      "Namakkal",
      "Nilgiris",
      "Perambalur",
      "Pudukkottai",
      "Ramanathapuram",
      "Ranipet",
      "Salem",
      "Sivaganga",
      "Tenkasi",
      "Thanjavur",
      "Theni",
      "Thoothukudi",
      "Tiruchirappalli",
      "Tirunelveli",
      "Tirupathur",
      "Tiruppur",
      "Tiruvallur",
      "Tiruvannamalai",
      "Tiruvarur",
      "Vellore",
      "Viluppuram",
      "Virudhunagar",
    ];

    logger.info("Seeding districts...");

    for (const name of tnDistricts) {
      await District.findOrCreate({
        where: {
          district_name: name,
          state_name: "Tamil Nadu",
        },
        defaults: {
          status: "ACTIVE",
        },
      });
    }

    // Get all districts so we have their IDs
    const districtRecords = await District.findAll({
      where: {
        state_name: "Tamil Nadu",
      },
    });

    const districtMap = {};

    districtRecords.forEach((district) => {
      districtMap[district.district_name] = district.district_id;
    });

    logger.info(`Districts ready: ${districtRecords.length}`);

    // ============================================================
    // 2. Seed Departments
    // ============================================================

    const departments = [
      {
        name: "Roads and Highways",
        desc: "Maintenance of state roads, bridges, bypasses and highways.",
      },
      {
        name: "Water Supply",
        desc: "Potable water piping, distribution, and reservoir leak repairs.",
      },
      {
        name: "Electricity",
        desc: "Power grid, transformers, electrical substations, and meters.",
      },
      {
        name: "Sanitation",
        desc: "Solid waste management, garbage collection, and city cleaning.",
      },
      {
        name: "Drainage and Sewerage",
        desc: "Stormwater drains, open sewers, and blockage removal.",
      },
      {
        name: "Public Health",
        desc: "Hospitals, sanitary inspections, and vector disease control.",
      },
      {
        name: "Municipal Administration",
        desc: "Urban planning, town tax logs, and building permissions.",
      },
      {
        name: "Transport",
        desc: "Public bus routes, auto stand markings, and local traffic plans.",
      },
      {
        name: "Parks and Recreation",
        desc: "Public park layout, gardening, benches and play setups.",
      },
      {
        name: "Environment",
        desc: "Pollution monitoring, industrial discharge, and tree plantations.",
      },
      {
        name: "Street Lighting",
        desc: "Sodium lamp replacements, cable connections, and timer switch grids.",
      },
      {
        name: "Animal Control",
        desc: "Stray dog vaccinations, cattle tracking, and veterinary shelters.",
      },
    ];

    logger.info("Seeding departments...");

    for (const department of departments) {
      await Department.findOrCreate({
        where: {
          department_name: department.name,
        },
        defaults: {
          description: department.desc,
          status: "ACTIVE",
        },
      });
    }

    // Get all departments so we have their IDs
    const departmentRecords = await Department.findAll();

    const departmentMap = {};

    departmentRecords.forEach((department) => {
      departmentMap[department.department_name] =
        department.department_id;
    });

    logger.info(`Departments ready: ${departmentRecords.length}`);

    // ============================================================
    // 3. Seed Department Admins
    // ============================================================

    const adminPasswordHash = await bcrypt.hash(
      "adminpassword123",
      10
    );

    logger.info("Seeding department admins...");

    for (const deptName of Object.keys(departmentMap)) {
      const deptId = departmentMap[deptName];

      const deptSlug = deptName
        .toLowerCase()
        .replace(/ /g, ".");

      const email = `admin.${deptSlug}@gov.in`;

      const phone = `9150000${deptId
        .toString()
        .padStart(3, "0")}`;

      await DepartmentAdmin.findOrCreate({
        where: {
          department_id: deptId,
        },
        defaults: {
          full_name: `${deptName} Admin`,
          email,
          phone,
          password_hash: adminPasswordHash,
          is_verified: true,
          status: "ACTIVE",
        },
      });
    }

    // ============================================================
    // 4. Seed Officers
    // ============================================================

    const officerPasswordHash = await bcrypt.hash(
      "officerpassword123",
      10
    );

    logger.info("Seeding regional officers...");

    const salemId = districtMap["Salem"];
    const erodeId = districtMap["Erode"];
    const coimbatoreId = districtMap["Coimbatore"];

    const highwaysDeptId =
      departmentMap["Roads and Highways"];

    const waterDeptId =
      departmentMap["Water Supply"];

    // Officer 1
    const [officer1] = await Officer.findOrCreate({
      where: {
        employee_id: "HW-SAL-8942",
      },
      defaults: {
        department_id: highwaysDeptId,
        district_id: salemId,
        full_name: "Ramesh Srinivasan",
        email: "ramesh.srinivasan@gov.in",
        phone: "9876543210",
        password_hash: officerPasswordHash,
        designation:
          "Divisional Engineer (DE) - Salem Highways",
        status: "ACTIVE",
      },
    });

    // Officer 2
    const [officer2] = await Officer.findOrCreate({
      where: {
        employee_id: "HW-ERD-7105",
      },
      defaults: {
        department_id: highwaysDeptId,
        district_id: erodeId,
        full_name: "Kavitha Natarajan",
        email: "kavitha.natarajan@gov.in",
        phone: "9876543211",
        password_hash: officerPasswordHash,
        designation:
          "Assistant Engineer (AE) - Erode Highways",
        status: "ACTIVE",
      },
    });

    // Officer 3
    const [officer3] = await Officer.findOrCreate({
      where: {
        employee_id: "HW-CBE-3321",
      },
      defaults: {
        department_id: highwaysDeptId,
        district_id: coimbatoreId,
        full_name: "Vijay Joseph",
        email: "vijay.joseph@gov.in",
        phone: "9876543212",
        password_hash: officerPasswordHash,
        designation:
          "Assistant Divisional Engineer (ADE) - Coimbatore Highways",
        status: "ACTIVE",
      },
    });

    // Officer 4
    const [officer4] = await Officer.findOrCreate({
      where: {
        employee_id: "WS-SAL-5541",
      },
      defaults: {
        department_id: waterDeptId,
        district_id: salemId,
        full_name: "Anita Desai",
        email: "anita.desai@gov.in",
        phone: "9876543213",
        password_hash: officerPasswordHash,
        designation: "AE - Water Distribution Salem",
        status: "ACTIVE",
      },
    });

    // Prevent unused-variable warning
    void officer3;
    void officer4;

    // ============================================================
    // 5. Seed Citizens
    // ============================================================

    const citizenPasswordHash = await bcrypt.hash(
      "citizenpassword123",
      10
    );

    logger.info("Seeding citizens...");

    const [citizenA] = await Citizen.findOrCreate({
      where: {
        email: "anbu@gmail.com",
      },
      defaults: {
        full_name: "Anbu Selvan",
        phone: "9444123456",
        password_hash: citizenPasswordHash,
        address: "12, Gandhi Street, Salem Bypass",
        district_id: salemId,
        pincode: "636005",
        is_verified: true,
        status: "ACTIVE",
      },
    });

    const [citizenB] = await Citizen.findOrCreate({
      where: {
        email: "bharath@gmail.com",
      },
      defaults: {
        full_name: "Bharath Kumar",
        phone: "9444123457",
        password_hash: citizenPasswordHash,
        address: "45, Temple View St, Erode Center",
        district_id: erodeId,
        pincode: "638001",
        is_verified: true,
        status: "ACTIVE",
      },
    });

    // ============================================================
    // 6. Seed Complaint 1
    // ============================================================

    logger.info("Seeding sample complaints...");

    const [comp1] = await Complaint.findOrCreate({
      where: {
        ticket_number: "GRV-2026-001245",
      },
      defaults: {
        citizen_id: citizenA.citizen_id,
        department_id: highwaysDeptId,
        district_id: salemId,
        officer_id: officer1.officer_id,
        title: "Major Pothole on NH-44 near junction",
        description:
          "A very large pothole has formed at the Salem bypass junction causing safety hazards.",
        address: "Salem Bypass NH-44 Crossing",
        latitude: 11.6643,
        longitude: 78.146,
        priority: "CRITICAL",
        status: "IN_PROGRESS",
      },
    });

    // ============================================================
    // 7. Complaint 1 AI Analysis
    // ============================================================

    await ComplaintAIAnalysis.findOrCreate({
      where: {
        complaint_id: comp1.complaint_id,
      },
      defaults: {
        predicted_department_id: highwaysDeptId,
        department_confidence: 0.95,
        predicted_category: "Infrastructure",
        predicted_priority: "CRITICAL",
        ai_summary:
          "AI detected a pothole infrastructure issue.",
        ocrText: "",
        detected_objects: ["pothole", "asphalt crack"],
      },
    });

    // ============================================================
    // 8. Complaint 1 Status History
    // ============================================================

    await ComplaintStatusHistory.findOrCreate({
      where: {
        complaint_id: comp1.complaint_id,
        new_status: "IN_PROGRESS",
      },
      defaults: {
        old_status: "SUBMITTED",
        changed_by: officer1.officer_id,
        changed_by_role: "OFFICER",
        remarks:
          "Work started. Hot mix repair ordered.",
      },
    });

    // ============================================================
    // 9. Seed Complaint 2
    // ============================================================

    const [comp2] = await Complaint.findOrCreate({
      where: {
        ticket_number: "GRV-2026-001246",
      },
      defaults: {
        citizen_id: citizenB.citizen_id,
        department_id: highwaysDeptId,
        district_id: erodeId,
        officer_id: officer2.officer_id,
        title: "Bridge expansion joint damaged",
        description:
          "The concrete joint on Erode bypass bridge has split open, causing heavy bumps for trucks.",
        address: "Cauvery Bridge, Erode Bypass",
        latitude: 11.341,
        longitude: 77.717,
        priority: "HIGH",
        status: "ASSIGNED",
      },
    });

    // ============================================================
    // 10. Complaint 2 AI Analysis
    // ============================================================

    await ComplaintAIAnalysis.findOrCreate({
      where: {
        complaint_id: comp2.complaint_id,
      },
      defaults: {
        predicted_department_id: highwaysDeptId,
        department_confidence: 0.91,
        predicted_category: "Maintenance",
        predicted_priority: "HIGH",
        ai_summary:
          "AI predicted expansion joint maintenance.",
        ocrText: "",
        detected_objects: ["bridge expansion gap"],
      },
    });

    // ============================================================
    // 11. Complaint 2 Status History
    // ============================================================

    await ComplaintStatusHistory.findOrCreate({
      where: {
        complaint_id: comp2.complaint_id,
        new_status: "ASSIGNED",
      },
      defaults: {
        old_status: null,
        changed_by: citizenB.citizen_id,
        changed_by_role: "SYSTEM",
        remarks:
          "Complaint auto-assigned on submission.",
      },
    });

    logger.info("Database seeding successfully completed.");

    return true;
  } catch (error) {
    logger.error("Failed to seed database");
    logger.error(`Error name: ${error.name}`);
    logger.error(`Error message: ${error.message}`);
    logger.error(
      `Original error: ${error.original?.message || "N/A"}`
    );

    throw error;
  }
};

module.exports = { seedDatabase };
