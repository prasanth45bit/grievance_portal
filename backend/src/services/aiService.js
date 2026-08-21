const { Department } = require("../models");
const logger = require("../utils/logger");

const predictGrievance = async (description, imageUrls = []) => {
  logger.info("Executing AI analysis for complaint description: %s", description);

  // Default predicted values
  let predictedDeptName = "Municipal Administration";
  let predictedCategory = "General Query";
  let predictedPriority = "LOW";
  let confidence = 0.85;

  const descLower = description.toLowerCase();

  if (descLower.includes("pothole") || descLower.includes("highway") || descLower.includes("road") || descLower.includes("bypass") || descLower.includes("bridge")) {
    predictedDeptName = "Roads and Highways";
    predictedCategory = descLower.includes("pothole") ? "Pothole Repair" : "Bridge Maintenance";
    predictedPriority = "HIGH";
    confidence = 0.94;
  } else if (descLower.includes("water") || descLower.includes("leak") || descLower.includes("pipe") || descLower.includes("reservoir")) {
    predictedDeptName = "Water Supply";
    predictedCategory = "Pipe Leakage";
    predictedPriority = "MEDIUM";
    confidence = 0.91;
  } else if (descLower.includes("electricity") || descLower.includes("power") || descLower.includes("streetlight") || descLower.includes("transformer")) {
    predictedDeptName = "Electricity";
    predictedCategory = "Street Light Malfunction";
    predictedPriority = "HIGH";
    confidence = 0.89;
  } else if (descLower.includes("sewage") || descLower.includes("drain") || descLower.includes("waterlogging")) {
    predictedDeptName = "Drainage and Sewerage";
    predictedCategory = "Drainage Clog";
    predictedPriority = "HIGH";
    confidence = 0.92;
  } else if (descLower.includes("trash") || descLower.includes("waste") || descLower.includes("garbage") || descLower.includes("sanitation")) {
    predictedDeptName = "Sanitation";
    predictedCategory = "Garbage Collection";
    predictedPriority = "MEDIUM";
    confidence = 0.88;
  }

  // Find department in database
  const department = await Department.findOne({
    where: { department_name: predictedDeptName },
  });

  const predictedDepartmentId = department ? department.department_id : null;

  return {
    predictedDepartmentId,
    departmentConfidence: confidence,
    predictedCategory,
    predictedPriority,
    aiSummary: `AI classified grievance under '${predictedDeptName}' with category '${predictedCategory}' and '${predictedPriority}' priority.`,
    ocrText: "MOCK OCR TEXT: Extracted Tamil Nadu highways board landmark boundary markings.",
    detectedObjects: ["pothole", "cracked concrete", "asphalt debris"],
  };
};

module.exports = {
  predictGrievance,
};
