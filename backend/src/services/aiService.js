const fs = require("fs");
const path = require("path");
const env = require("../config/environment");
const { Department } = require("../models");
const logger = require("../utils/logger");

/**
 * Calls the Python BERT classifier service (department-classifier).
 */
const callTextClassifier = async (text) => {
  if (!text || text.trim().length < 3) return null;

  const url = `${env.AI_SERVICE_URL}/predict`;
  try {
    logger.info("Calling BERT text classifier at: %s", url);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint: text, top_k: 3 }),
      signal: AbortSignal.timeout(6000), // 6s timeout
    });

    if (!response.ok) {
      logger.warn("BERT service returned HTTP %d", response.status);
      return null;
    }

    const data = await response.json();
    return {
      department: data.predicted_department,
      confidence: data.confidence,
      departmentId: data.department_id,
      topPredictions: data.top_predictions || [],
      latencyMs: data.inference_time_ms,
    };
  } catch (error) {
    logger.warn("BERT text classifier unreachable or timed out: %s", error.message);
    return null;
  }
};

/**
 * Resolves a file object, path, or URL to an absolute disk path.
 */
const resolveFilePath = (fileOrPath) => {
  if (!fileOrPath) return null;

  // Case 1: Multer file object
  if (typeof fileOrPath === "object" && fileOrPath.path) {
    return fileOrPath.path;
  }

  // Case 2: String path or relative URL
  if (typeof fileOrPath === "string") {
    if (fs.existsSync(fileOrPath)) return fileOrPath;
    
    // Relative to uploads folder
    const stripped = fileOrPath.replace(/^\/?uploads\//, "");
    const candidate = path.join(__dirname, "../../uploads", stripped);
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
};

/**
 * Calls the Python YOLO image detection service (ai-service).
 */
const callImageDetector = async (files) => {
  if (!files || files.length === 0) return null;

  // Process the first uploaded image
  const firstFile = Array.isArray(files) ? files[0] : files;
  const filePath = resolveFilePath(firstFile);

  if (!filePath || !fs.existsSync(filePath)) {
    logger.warn("Image file path could not be resolved on disk: %s", filePath);
    return null;
  }

  const url = `${env.IMAGE_SERVICE_URL}/predict`;
  try {
    logger.info("Calling YOLO image detector at: %s for file: %s", url, filePath);

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).slice(1).toLowerCase() || "jpeg";
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append("file", blob, fileName);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      logger.warn("YOLO image service returned HTTP %d", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.warn("YOLO image service unreachable or timed out: %s", error.message);
    return null;
  }
};

/**
 * Determines problem category and priority based on visual detection or department.
 */
const deriveCategoryAndPriority = (primaryDetection, departmentName) => {
  if (primaryDetection) {
    const cls = primaryDetection.class_name.toLowerCase();
    if (cls.includes("pothole")) return { category: "Pothole Repair", priority: "HIGH" };
    if (cls.includes("crack") || cls.includes("damage")) return { category: "Road Surface Maintenance", priority: "MEDIUM" };
    if (cls.includes("manhole")) return { category: "Open Manhole Repair", priority: "CRITICAL" };
    if (cls.includes("sewage")) return { category: "Sewage Overflow Clearing", priority: "CRITICAL" };
    if (cls.includes("garbage") || cls.includes("trash")) return { category: "Garbage Removal", priority: "MEDIUM" };
    if (cls.includes("leak") || cls.includes("pipe")) return { category: "Pipe Leakage Repair", priority: "HIGH" };
    if (cls.includes("pole") || cls.includes("wire")) return { category: "Damaged Power Infrastructure", priority: "CRITICAL" };
    if (cls.includes("light") || cls.includes("lamp")) return { category: "Streetlight Replacement", priority: "MEDIUM" };
    if (cls.includes("animal") || cls.includes("dog") || cls.includes("cattle")) return { category: "Stray Animal Control", priority: "MEDIUM" };
  }

  // Fallbacks by Department
  switch (departmentName) {
    case "Roads and Highways":
      return { category: "Road Maintenance", priority: "HIGH" };
    case "Water Supply":
      return { category: "Water Distribution", priority: "HIGH" };
    case "Drainage and Sewerage":
      return { category: "Drainage Clearance", priority: "HIGH" };
    case "Electricity":
      return { category: "Power Infrastructure", priority: "HIGH" };
    case "Sanitation":
      return { category: "Sanitation & Waste Management", priority: "MEDIUM" };
    case "Street Lighting":
      return { category: "Street Lighting Maintenance", priority: "MEDIUM" };
    case "Animal Control":
      return { category: "Stray Animal Intervention", priority: "MEDIUM" };
    default:
      return { category: "General Civic Redressal", priority: "LOW" };
  }
};

/**
 * Intelligent Multi-Modal Fusion combining BERT text predictions and YOLO image predictions.
 */
const predictGrievance = async (description, files = []) => {
  logger.info("Executing multi-modal AI analysis for complaint...");

  const isGenericDescription = !description || 
    description.trim().length < 5 || 
    description.toLowerCase().includes("civic issue submitted via photograph");

  // 1. Parallel asynchronous queries to BERT and YOLO
  const [textResult, imageResult] = await Promise.all([
    isGenericDescription ? Promise.resolve(null) : callTextClassifier(description),
    callImageDetector(files),
  ]);

  let finalDeptName = null;
  let finalConfidence = 0.50;
  let aiSummary = "";
  let ocrText = "";
  let detectedObjectsList = [];

  const hasTextEvidence = !!(textResult && textResult.department);
  const hasVisualEvidence = !!(
    imageResult && 
    imageResult.status === "completed" && 
    imageResult.detections && 
    imageResult.detections.length > 0
  );

  if (imageResult) {
    ocrText = imageResult.ocr_text || "";
    detectedObjectsList = (imageResult.detections || []).map(d => ({
      class_name: d.class_name,
      confidence: d.confidence,
      bbox: d.bbox,
      suggested_department: d.suggested_department,
      visual_issue: d.visual_issue,
    }));
  }

  // 2. FUSION LOGIC (Section 14)
  if (hasTextEvidence && hasVisualEvidence) {
    const textDept = textResult.department;
    const visualDept = imageResult.primary_department;
    const visualTop = imageResult.detections[0];

    if (textDept === visualDept) {
      // Rule 1: Text and image predictions AGREE -> High confidence agreement
      finalDeptName = textDept;
      finalConfidence = Math.min(0.99, Math.max(textResult.confidence, visualTop.confidence) + 0.05);
      aiSummary = `Multi-modal consensus: Text classification (${Math.round(textResult.confidence * 100)}%) and visual detection of '${visualTop.class_name}' (${Math.round(visualTop.confidence * 100)}%) concordantly confirm assignment to '${finalDeptName}'.`;
    } else {
      // Rule 2: Disagreement between text and image
      if (visualTop.confidence >= 0.70) {
        // High-confidence visual evidence takes operational precedence with audit note
        finalDeptName = visualDept;
        finalConfidence = visualTop.confidence;
        aiSummary = `Visual detection verified '${visualTop.class_name}' (${Math.round(visualTop.confidence * 100)}% confidence, routed to '${visualDept}'). Note: Text classification proposed '${textDept}' (${Math.round(textResult.confidence * 100)}%). Nodal officer review recommended for cross-department verification.`;
      } else if (textResult.confidence >= 0.80) {
        // High-confidence text with ambiguous visual evidence
        finalDeptName = textDept;
        finalConfidence = textResult.confidence;
        aiSummary = `Text classification strongly indicated '${textDept}' (${Math.round(textResult.confidence * 100)}%). Image detection detected '${visualTop.class_name}' with lower confidence (${Math.round(visualTop.confidence * 100)}%). Retaining text-guided routing.`;
      } else {
        // Ambiguous evidence from both sources -> Route to Municipal Administration for triage
        finalDeptName = "Municipal Administration";
        finalConfidence = 0.50;
        aiSummary = `Discrepancy between text analysis ('${textDept}', ${Math.round(textResult.confidence * 100)}%) and visual detection ('${visualTop.class_name}', ${Math.round(visualTop.confidence * 100)}%). Forwarded to Municipal Administration for manual officer triage.`;
      }
    }
  } else if (hasVisualEvidence) {
    // Visual evidence only (image-only complaint or text classifier unavailable)
    const visualTop = imageResult.detections[0];
    finalDeptName = imageResult.primary_department;
    finalConfidence = visualTop.confidence;
    aiSummary = `Computer Vision identified '${visualTop.class_name}' with ${Math.round(visualTop.confidence * 100)}% confidence. Routed to '${finalDeptName}'.`;
  } else if (hasTextEvidence) {
    // Text evidence only
    finalDeptName = textResult.department;
    finalConfidence = textResult.confidence;
    const imgNote = imageResult ? " Image showed no recognizable civic anomalies." : "";
    aiSummary = `NLP classified grievance text under '${finalDeptName}' with ${Math.round(finalConfidence * 100)}% confidence.${imgNote}`;
  } else {
    // Rule 5: Fallback when neither service returns reliable prediction
    finalDeptName = "Municipal Administration";
    finalConfidence = 0.40;
    aiSummary = "Automated AI detection produced no conclusive classification. Routed to Municipal Administration for manual verification.";
  }

  // 3. Derive Category and Priority
  const topVisual = hasVisualEvidence ? imageResult.detections[0] : null;
  const { category: predictedCategory, priority: predictedPriority } = deriveCategoryAndPriority(topVisual, finalDeptName);

  // 4. Fetch Department record from MySQL Database
  const department = await Department.findOne({
    where: { department_name: finalDeptName },
  });

  const predictedDepartmentId = department ? department.department_id : null;

  return {
    predictedDepartmentId,
    departmentConfidence: parseFloat(finalConfidence.toFixed(4)),
    predictedCategory,
    predictedPriority,
    aiSummary,
    ocrText: ocrText || "",
    detectedObjects: {
      detections: detectedObjectsList,
      image_info: imageResult ? imageResult.image : null,
      text_prediction: textResult ? {
        department: textResult.department,
        confidence: textResult.confidence,
      } : null,
      primary_visual_department: imageResult ? imageResult.primary_department : null,
      status: imageResult ? imageResult.status : "text_only",
      inference_time_ms: imageResult ? imageResult.inference_time_ms : null,
    },
  };
};

module.exports = {
  predictGrievance,
  callTextClassifier,
  callImageDetector,
};
