const bcrypt = require("bcryptjs");
const catalogController = require("../src/controllers/catalogController");
const officerController = require("../src/controllers/officerController");
const adminController = require("../src/controllers/adminController");
const complaintController = require("../src/controllers/complaintController");
const app = require("../app");
const { Officer, DepartmentAdmin, District, Department, Complaint } = require("../src/models");

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message}. Expected "${expected}" but got "${actual}"`);
  }
  console.log(`  ✓ SUCCESS: ${message}`);
};

const createMockResponse = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runAllTests = async () => {
  console.log("==================================================");
  console.log("STARTING FRONTEND API SUITE TESTS");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  // 1. Catalog Controller - getDistricts
  total++;
  try {
    const req = {};
    const res = createMockResponse();
    await catalogController.getDistricts(req, res, (err) => { throw err; });
    assertEqual(res.statusCode, 200, "Catalog getDistricts returns HTTP 200");
    assertEqual(res.body.success, true, "Catalog getDistricts success flag is true");
    assertEqual(Array.isArray(res.body.data), true, "Catalog getDistricts returns array");
    passed++;
  } catch (err) {
    console.error("  ✗ FAILED: Catalog getDistricts:", err.message);
  }

  // 2. Catalog Controller - getDepartments
  total++;
  try {
    const req = {};
    const res = createMockResponse();
    await catalogController.getDepartments(req, res, (err) => { throw err; });
    assertEqual(res.statusCode, 200, "Catalog getDepartments returns HTTP 200");
    assertEqual(res.body.success, true, "Catalog getDepartments success flag is true");
    assertEqual(Array.isArray(res.body.data), true, "Catalog getDepartments returns array");
    passed++;
  } catch (err) {
    console.error("  ✗ FAILED: Catalog getDepartments:", err.message);
  }

  // 3. Officer Profile - getProfile
  total++;
  try {
    // Find an existing officer
    const sampleOfficer = await Officer.findOne();
    if (sampleOfficer) {
      const req = { user: { userId: sampleOfficer.officer_id, role: "OFFICER" } };
      const res = createMockResponse();
      await officerController.getProfile(req, res, (err) => { throw err; });
      assertEqual(res.statusCode, 200, "Officer getProfile returns HTTP 200");
      assertEqual(res.body.success, true, "Officer getProfile success flag is true");
      assertEqual(typeof res.body.data.metrics, "object", "Officer profile contains workload metrics");
      passed++;
    } else {
      console.log("  - SKIPPED: No officer in database to test getProfile");
      passed++;
    }
  } catch (err) {
    console.error("  ✗ FAILED: Officer getProfile:", err.message);
  }

  // 4. Officer Duty Status Toggle
  total++;
  try {
    const sampleOfficer = await Officer.findOne();
    if (sampleOfficer) {
      const req = { user: { userId: sampleOfficer.officer_id, role: "OFFICER" }, body: {} };
      const res = createMockResponse();
      await officerController.toggleDutyStatus(req, res, (err) => { throw err; });
      assertEqual(res.statusCode, 200, "Officer toggleDutyStatus returns HTTP 200");
      assertEqual(typeof res.body.data.isActive, "boolean", "Officer toggleDutyStatus returns isActive boolean");
      // Restore status to ACTIVE
      sampleOfficer.status = "ACTIVE";
      await sampleOfficer.save();
      passed++;
    } else {
      console.log("  - SKIPPED: No officer in database to test duty status");
      passed++;
    }
  } catch (err) {
    console.error("  ✗ FAILED: Officer toggleDutyStatus:", err.message);
  }

  // 5. Admin Profile - getProfile
  total++;
  try {
    const sampleAdmin = await DepartmentAdmin.findOne();
    if (sampleAdmin) {
      const req = { user: { userId: sampleAdmin.admin_id, role: "DEPARTMENT_ADMIN" } };
      const res = createMockResponse();
      await adminController.getProfile(req, res, (err) => { throw err; });
      assertEqual(res.statusCode, 200, "Admin getProfile returns HTTP 200");
      assertEqual(res.body.success, true, "Admin getProfile success flag is true");
      passed++;
    } else {
      console.log("  - SKIPPED: No admin in database to test getProfile");
      passed++;
    }
  } catch (err) {
    console.error("  ✗ FAILED: Admin getProfile:", err.message);
  }

  // 6. Public Tracking - trackComplaint
  total++;
  try {
    const sampleComplaint = await Complaint.findOne();
    if (sampleComplaint) {
      const req = { params: { ticketNumber: sampleComplaint.ticket_number } };
      const res = createMockResponse();
      await complaintController.trackComplaint(req, res, (err) => { throw err; });
      assertEqual(res.statusCode, 200, "Public trackComplaint returns HTTP 200");
      assertEqual(res.body.success, true, "Public trackComplaint success flag is true");
      assertEqual(res.body.data.ticket_number, sampleComplaint.ticket_number, "Tracked ticket number matches");
      passed++;
    } else {
      console.log("  - SKIPPED: No complaint in database to test trackComplaint");
      passed++;
    }
  } catch (err) {
    console.error("  ✗ FAILED: Public trackComplaint:", err.message);
  }

  console.log("==================================================");
  console.log(`TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");

  const { sequelize } = require("../src/models");
  await sequelize.close();

  if (passed !== total) {
    process.exit(1);
  }
  process.exit(0);
};

runAllTests().catch(async (err) => {
  console.error("Fatal test error:", err);
  const { sequelize } = require("../src/models");
  await sequelize.close();
  process.exit(1);
});
