const { predictGrievance } = require("../src/services/aiService");
const { Department } = require("../src/models");

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message}. Expected "${expected}" but got "${actual}"`);
  }
  console.log(`  ✓ SUCCESS: ${message}`);
};

const runAIFusionTests = async () => {
  console.log("==================================================");
  console.log("STARTING AI SERVICE MULTI-MODAL FUSION TESTS");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  // Mock Department.findOne
  const mockDepartments = {
    "Roads and Highways": { department_id: 1, department_name: "Roads and Highways" },
    "Water Supply": { department_id: 2, department_name: "Water Supply" },
    "Sanitation": { department_id: 4, department_name: "Sanitation" },
    "Drainage and Sewerage": { department_id: 5, department_name: "Drainage and Sewerage" },
    "Electricity": { department_id: 3, department_name: "Electricity" },
    "Municipal Administration": { department_id: 7, department_name: "Municipal Administration" },
  };

  const origFindOne = Department.findOne;
  Department.findOne = async ({ where }) => {
    return mockDepartments[where.department_name] || { department_id: 99, department_name: where.department_name };
  };

  try {
    // Test 1: Fallback handling when AI services are offline
    total++;
    console.log("\n[Test 1] Fallback when services are unreachable");
    const result1 = await predictGrievance("There is a pothole on the road", []);
    assertEqual(typeof result1.predictedDepartmentId === "number" || result1.predictedDepartmentId === null, true, "Returns valid department ID format");
    assertEqual(typeof result1.departmentConfidence, "number", "Returns numeric confidence");
    assertEqual(typeof result1.aiSummary, "string", "Returns string summary");
    assertEqual(typeof result1.detectedObjects, "object", "Returns structured detectedObjects audit object");
    passed++;

    // Test 2: Image-only description handling
    total++;
    console.log("\n[Test 2] Generic or Image-only description fallback");
    const result2 = await predictGrievance("Civic issue submitted via photograph attachment.", []);
    assertEqual(typeof result2.predictedCategory, "string", "Derives predicted category");
    assertEqual(typeof result2.predictedPriority, "string", "Derives predicted priority");
    passed++;

    console.log("\n==================================================");
    console.log(`AI FUSION TESTS COMPLETED: ${passed} / ${total} PASSED`);
    console.log("==================================================");
  } finally {
    Department.findOne = origFindOne;
  }
};

runAIFusionTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("AI Tests Failed:", err);
    process.exit(1);
  });
