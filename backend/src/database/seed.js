const bcrypt = require("bcryptjs");
const {
  sequelize,
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

    // 1. Seed Tamil Nadu Districts (38)
    const tnDistricts = [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
      "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
      "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
      "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
      "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
      "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
      "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
      "Vellore", "Viluppuram", "Virudhunagar"
    ];

    logger.info("Seeding districts...");
    const districtRecords = await District.bulkCreate(
      tnDistricts.map(name => ({
        district_name: name,
        state_name: "Tamil Nadu",
        status: "ACTIVE"
      }))
    );

    // Map names to generated IDs
    const districtMap = {};
    districtRecords.forEach(d => {
      districtMap[d.district_name] = d.district_id;
    });

    // 2. Seed Departments (12)
    const departments = [
      { name: "Roads and Highways", desc: "Maintenance of state roads, bridges, bypasses and highways." },
      { name: "Water Supply", desc: "Potable water piping, distribution, and reservoir leak repairs." },
      { name: "Electricity", desc: "Power grid, transformers, electrical substations, and meters." },
      { name: "Sanitation", desc: "Solid waste management, garbage collection, and city cleaning." },
      { name: "Drainage and Sewerage", desc: "Stormwater drains, open sewers, and blockage removal." },
      { name: "Public Health", desc: "Hospitals, sanitary inspections, and vector disease control." },
      { name: "Municipal Administration", desc: "Urban planning, town tax logs, and building permissions." },
      { name: "Transport", desc: "Public bus routes, auto stand markings, and local traffic plans." },
      { name: "Parks and Recreation", desc: "Public park layout, gardening, benches and play setups." },
      { name: "Environment", desc: "Pollution monitoring, industrial discharge, and tree plantations." },
      { name: "Street Lighting", desc: "Sodium lamp replacements, cable connections, and timer switch grids." },
      { name: "Animal Control", desc: "Stray dog vaccinations, cattle tracking, and veterinary shelters." }
    ];

    logger.info("Seeding departments...");
    const departmentRecords = await Department.bulkCreate(
      departments.map(d => ({
        department_name: d.name,
        description: d.desc,
        status: "ACTIVE"
      }))
    );

    const departmentMap = {};
    departmentRecords.forEach(dept => {
      departmentMap[dept.department_name] = dept.department_id;
    });

    // 3. Seed Department Admins
    // We create one admin for each department
    const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
    logger.info("Seeding department admins...");
    
    for (const deptName of Object.keys(departmentMap)) {
      const deptId = departmentMap[deptName];
      const deptSlug = deptName.toLowerCase().replace(/ /g, ".");
      await DepartmentAdmin.create({
        department_id: deptId,
        full_name: `${deptName} Admin`,
        email: `admin.${deptSlug}@gov.in`,
        phone: `9150000${deptId.toString().padStart(3, "0")}`,
        password_hash: adminPasswordHash,
        is_verified: true,
        status: "ACTIVE"
      });
    }

    // 4. Seed Nodal Officers across districts
    const officerPasswordHash = await bcrypt.hash("officerpassword123", 10);
    logger.info("Seeding regional officers...");

    // Create Salem Nodal Officer for Roads and Highways
    const salemId = districtMap["Salem"];
    const erodeId = districtMap["Erode"];
    const coimbatoreId = districtMap["Coimbatore"];
    const highwaysDeptId = departmentMap["Roads and Highways"];
    const waterDeptId = departmentMap["Water Supply"];

    const officer1 = await Officer.create({
      department_id: highwaysDeptId,
      district_id: salemId,
      employee_id: "HW-SAL-8942",
      full_name: "Ramesh Srinivasan",
      email: "ramesh.srinivasan@gov.in",
      phone: "9876543210",
      password_hash: officerPasswordHash,
      designation: "Divisional Engineer (DE) - Salem Highways",
      status: "ACTIVE"
    });

    // Create Erode Nodal Officer for Roads and Highways
    const officer2 = await Officer.create({
      department_id: highwaysDeptId,
      district_id: erodeId,
      employee_id: "HW-ERD-7105",
      full_name: "Kavitha Natarajan",
      email: "kavitha.natarajan@gov.in",
      phone: "9876543211",
      password_hash: officerPasswordHash,
      designation: "Assistant Engineer (AE) - Erode Highways",
      status: "ACTIVE"
    });

    // Create Coimbatore Nodal Officer for Roads and Highways
    const officer3 = await Officer.create({
      department_id: highwaysDeptId,
      district_id: coimbatoreId,
      employee_id: "HW-CBE-3321",
      full_name: "Vijay Joseph",
      email: "vijay.joseph@gov.in",
      phone: "9876543212",
      password_hash: officerPasswordHash,
      designation: "Assistant Divisional Engineer (ADE) - Coimbatore Highways",
      status: "ACTIVE"
    });

    // Create Salem Nodal Officer for Water Supply (to test cross-department boundaries)
    const officer4 = await Officer.create({
      department_id: waterDeptId,
      district_id: salemId,
      employee_id: "WS-SAL-5541",
      full_name: "Anita Desai",
      email: "anita.desai@gov.in",
      phone: "9876543213",
      password_hash: officerPasswordHash,
      designation: "AE - Water Distribution Salem",
      status: "ACTIVE"
    });

    // 5. Seed Citizens
    const citizenPasswordHash = await bcrypt.hash("citizenpassword123", 10);
    logger.info("Seeding citizens...");

    const citizenA = await Citizen.create({
      full_name: "Anbu Selvan",
      email: "anbu@gmail.com",
      phone: "9444123456",
      password_hash: citizenPasswordHash,
      address: "12, Gandhi Street, Salem Bypass",
      district_id: salemId,
      pincode: "636005",
      is_verified: true,
      status: "ACTIVE"
    });

    const citizenB = await Citizen.create({
      full_name: "Bharath Kumar",
      email: "bharath@gmail.com",
      phone: "9444123457",
      password_hash: citizenPasswordHash,
      address: "45, Temple View St, Erode Center",
      district_id: erodeId,
      pincode: "638001",
      is_verified: true,
      status: "ACTIVE"
    });

    // 6. Seed sample Complaints
    logger.info("Seeding sample complaints...");
    
    // Complaint 1: Salem Highways - Assigned to Officer 1
    const comp1 = await Complaint.create({
      ticket_number: "GRV-2026-001245",
      citizen_id: citizenA.citizen_id,
      department_id: highwaysDeptId,
      district_id: salemId,
      officer_id: officer1.officer_id,
      title: "Major Pothole on NH-44 near junction",
      description: "A very large pothole has formed at the Salem bypass junction causing safety hazards.",
      address: "Salem Bypass NH-44 Crossing",
      latitude: 11.6643,
      longitude: 78.146,
      priority: "CRITICAL",
      status: "IN_PROGRESS"
    });

    await ComplaintAIAnalysis.create({
      complaint_id: comp1.complaint_id,
      predicted_department_id: highwaysDeptId,
      department_confidence: 0.9500,
      predicted_category: "Infrastructure",
      predicted_priority: "CRITICAL",
      ai_summary: "AI detected a pothole infrastructure issue.",
      ocrText: "",
      detected_objects: ["pothole", "asphalt crack"]
    });

    await ComplaintStatusHistory.create({
      complaint_id: comp1.complaint_id,
      old_status: "SUBMITTED",
      new_status: "IN_PROGRESS",
      changed_by: officer1.officer_id,
      changed_by_role: "OFFICER",
      remarks: "Work started. Hot mix repair ordered."
    });

    // Complaint 2: Erode Highways - Assigned to Officer 2
    const comp2 = await Complaint.create({
      ticket_number: "GRV-2026-001246",
      citizen_id: citizenB.citizen_id,
      department_id: highwaysDeptId,
      district_id: erodeId,
      officer_id: officer2.officer_id,
      title: "Bridge expansion joint damaged",
      description: "The concrete joint on Erode bypass bridge has split open, causing heavy bumps for trucks.",
      address: "Cauvery Bridge, Erode Bypass",
      latitude: 11.341,
      longitude: 77.717,
      priority: "HIGH",
      status: "ASSIGNED"
    });

    await ComplaintAIAnalysis.create({
      complaint_id: comp2.complaint_id,
      predicted_department_id: highwaysDeptId,
      department_confidence: 0.9100,
      predicted_category: "Maintenance",
      predicted_priority: "HIGH",
      ai_summary: "AI predicted expansion joint maintenance.",
      ocrText: "",
      detected_objects: ["bridge expansion gap"]
    });

    await ComplaintStatusHistory.create({
      complaint_id: comp2.complaint_id,
      old_status: null,
      new_status: "ASSIGNED",
      changed_by: citizenB.citizen_id,
      changed_by_role: "SYSTEM",
      remarks: "Complaint auto-assigned on submission."
    });

    logger.info("Database seeding successfully completed.");
    process.exit(0);
  } catch (error) {
    logger.error("Failed to seed database: %s", error.stack);
    process.exit(1);
  }
};

seedDatabase();
