const { getComplaintDetails } = require("../src/controllers/complaintController");
const logger = require("../src/utils/logger");

// Simple Test Runner assertions
const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message}. Expected "${expected}" but got "${actual}"`);
  }
  console.log(`  ✓ SUCCESS: ${message}`);
};

const runSecurityTests = async () => {
  console.log("==================================================");
  console.log("STARTING BACKEND SECURITY BOUNDARY TESTS");
  console.log("==================================================");

  let testCount = 0;
  let passCount = 0;

  // Mock database records
  const mockHighwaysSalemComplaint = {
    complaint_id: 1,
    citizen_id: 101,
    department_id: 10, // Highways
    district_id: 20,   // Salem
    officer_id: 301,
    status: "IN_PROGRESS"
  };

  // Mock Controller finder
  const mockFindByPk = async (id) => {
    if (id == 1) return mockHighwaysSalemComplaint;
    return null;
  };

  // Override finder on Complaint model for unit assertion tests
  const originalFindByPk = require("../src/models/Complaint").findByPk;
  require("../src/models/Complaint").findByPk = mockFindByPk;

  // Mock res object builder
  const createMockResponse = () => {
    const res = {};
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

  const executeTest = async (testName, userPayload, complaintId, expectedStatus, expectedSuccess) => {
    testCount++;
    try {
      const req = {
        params: { id: complaintId },
        user: userPayload
      };
      const res = createMockResponse();
      let nextCalled = false;
      const next = (err) => {
        nextCalled = true;
      };

      await getComplaintDetails(req, res, next);

      assertEqual(res.body.success, expectedSuccess, `${testName} - success parameter`);
      if (expectedStatus) {
        assertEqual(res.statusCode, expectedStatus, `${testName} - HTTP status code`);
      }
      passCount++;
    } catch (error) {
      console.error(`  ✗ FAILED: ${testName}`, error.message);
    }
  };

  // Test 1: Citizen A attempts to access their own complaint
  await executeTest(
    "Citizen A accesses Citizen A's complaint",
    { userId: 101, role: "CITIZEN" },
    1,
    200,
    true
  );

  // Test 2: Citizen B attempts to access Citizen A's complaint
  await executeTest(
    "Citizen B accesses Citizen A's complaint",
    { userId: 102, role: "CITIZEN" },
    1,
    403,
    false
  );

  // Test 3: Highways Salem Nodal Officer accesses Highways Salem complaint
  await executeTest(
    "Highways Salem Nodal Officer accesses Salem complaint",
    { userId: 301, role: "OFFICER", departmentId: 10, districtId: 20 },
    1,
    200,
    true
  );

  // Test 4: Highways Erode Nodal Officer attempts to access Highways Salem complaint
  await executeTest(
    "Highways Erode Nodal Officer accesses Salem complaint",
    { userId: 302, role: "OFFICER", departmentId: 10, districtId: 21 }, // Erode district = 21
    1,
    403,
    false
  );

  // Test 5: Water Supply Salem Nodal Officer attempts to access Highways Salem complaint
  await executeTest(
    "Water Supply Salem Nodal Officer accesses Highways complaint",
    { userId: 303, role: "OFFICER", departmentId: 11, districtId: 20 }, // Water Supply dept = 11
    1,
    403,
    false
  );

  // Test 6: Highways Department Admin accesses Highways Salem complaint
  await executeTest(
    "Highways Department Admin accesses Highways complaint",
    { userId: 501, role: "DEPARTMENT_ADMIN", departmentId: 10 },
    1,
    200,
    true
  );

  // Test 7: Water Supply Department Admin attempts to access Highways Salem complaint
  await executeTest(
    "Water Supply Department Admin accesses Highways complaint",
    { userId: 502, role: "DEPARTMENT_ADMIN", departmentId: 11 },
    1,
    403,
    false
  );

  // Restore original finder
  require("../src/models/Complaint").findByPk = originalFindByPk;

  console.log("==================================================");
  console.log(`TEST RUN COMPLETED: ${passCount} / ${testCount} PASSED`);
  console.log("==================================================");

  if (passCount === testCount) {
    logger.info("All security boundary logic verified successfully.");
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runSecurityTests();
