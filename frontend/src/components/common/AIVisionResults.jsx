import React, { useState, useRef, useEffect } from "react";
import { getImageUrl } from "../../utils/api";

/**
 * Normalizes detection input across live YOLO API responses and DB stored models.
 */
function extractDetections(analysisData) {
  if (!analysisData) return [];

  // Case 1: Live YOLO API response data format
  if (Array.isArray(analysisData.detections)) {
    return analysisData.detections;
  }

  // Case 2: DB ComplaintAIAnalysis.detected_objects object format
  const obj = analysisData.detected_objects || analysisData;
  if (obj && Array.isArray(obj.detections)) {
    return obj.detections;
  }

  // Case 3: DB ComplaintAIAnalysis.detected_objects is an array of objects or strings
  if (Array.isArray(obj)) {
    return obj.map((item, idx) => {
      if (typeof item === "string") {
        return {
          class_name: item,
          confidence: analysisData.department_confidence || 0.85,
          bbox: null,
          suggested_department: analysisData.predicted_category || "Civic Administration",
          visual_issue: `Detected civic anomaly: ${item}`,
        };
      }
      return item;
    });
  }

  return [];
}

/**
 * Color palettes and styling based on civic defect classification
 */
function getClassTheme(className = "") {
  const c = (className || "").toLowerCase();
  if (c.includes("pothole")) {
    return {
      border: "border-red-500",
      bg: "bg-red-500/15",
      tagBg: "bg-red-600",
      text: "text-red-700",
      pillBg: "bg-red-50",
      ring: "ring-red-400",
      hex: "#ef4444",
      icon: "warning",
      label: "Pothole Defect",
      priority: "CRITICAL",
    };
  }
  if (c.includes("crack") || c.includes("damage") || c.includes("expansion")) {
    return {
      border: "border-amber-500",
      bg: "bg-amber-500/15",
      tagBg: "bg-amber-600",
      text: "text-amber-700",
      pillBg: "bg-amber-50",
      ring: "ring-amber-400",
      hex: "#f59e0b",
      icon: "construction",
      label: "Road Surface Damage",
      priority: "HIGH",
    };
  }
  if (c.includes("garbage") || c.includes("trash") || c.includes("waste")) {
    return {
      border: "border-emerald-500",
      bg: "bg-emerald-500/15",
      tagBg: "bg-emerald-600",
      text: "text-emerald-700",
      pillBg: "bg-emerald-50",
      ring: "ring-emerald-400",
      hex: "#10b981",
      icon: "delete_sweep",
      label: "Garbage Dump",
      priority: "MEDIUM",
    };
  }
  if (c.includes("manhole") || c.includes("drain") || c.includes("sewage") || c.includes("water") || c.includes("leak")) {
    return {
      border: "border-cyan-500",
      bg: "bg-cyan-500/15",
      tagBg: "bg-cyan-600",
      text: "text-cyan-700",
      pillBg: "bg-cyan-50",
      ring: "ring-cyan-400",
      hex: "#06b6d4",
      icon: "water_damage",
      label: "Drainage / Water Hazard",
      priority: "CRITICAL",
    };
  }
  if (c.includes("light") || c.includes("lamp") || c.includes("pole") || c.includes("wire") || c.includes("power")) {
    return {
      border: "border-amber-400",
      bg: "bg-amber-400/15",
      tagBg: "bg-amber-500",
      text: "text-amber-800",
      pillBg: "bg-amber-50",
      ring: "ring-amber-300",
      hex: "#eab308",
      icon: "bolt",
      label: "Electrical / Lighting",
      priority: "HIGH",
    };
  }
  return {
    border: "border-indigo-500",
    bg: "bg-indigo-500/15",
    tagBg: "bg-indigo-600",
    text: "text-indigo-700",
    pillBg: "bg-indigo-50",
    ring: "ring-indigo-400",
    hex: "#6366f1",
    icon: "detection",
    label: className || "Civic Issue",
    priority: "MEDIUM",
  };
}

export default function AIVisionResults({
  imageSrc,
  analysisData,
  onApplyRecommendation = null,
  showBoundingBoxesDefault = true,
  title = "AI Vision & Computer Vision Evidence",
  compact = false,
  className = "",
}) {
  const [showBoxes, setShowBoxes] = useState(showBoundingBoxesDefault);
  const [showLabels] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [naturalDim, setNaturalDim] = useState({ w: 0, h: 0 });
  const [previewUrl, setPreviewUrl] = useState("");

  const imgRef = useRef(null);

  // Compute preview URL
  useEffect(() => {
    if (!imageSrc) {
      setPreviewUrl("");
      return;
    }
    if (typeof imageSrc === "string") {
      setPreviewUrl(getImageUrl(imageSrc));
    } else if (imageSrc instanceof File || imageSrc instanceof Blob) {
      const url = URL.createObjectURL(imageSrc);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageSrc]);

  // Extract detections list
  const detections = extractDetections(analysisData);

  // Extract OCR signboard text
  const ocrText =
    analysisData?.ocr_text ||
    analysisData?.ocrText ||
    analysisData?.detected_objects?.ocr_text ||
    null;

  // Extract latency & model metadata
  const latencyMs =
    analysisData?.inference_time_ms ||
    analysisData?.detected_objects?.inference_time_ms ||
    null;

  const modelName =
    analysisData?.model?.name ||
    analysisData?.model_version ||
    "road_damage_yolov8n";

  const primaryDept =
    analysisData?.primary_department ||
    analysisData?.suggested_department ||
    analysisData?.detected_objects?.primary_visual_department ||
    (detections.length > 0 ? detections[0].suggested_department : null);

  const primaryConf =
    analysisData?.primary_confidence ||
    analysisData?.department_confidence ||
    (detections.length > 0 ? detections[0].confidence : null);

  const status =
    analysisData?.status ||
    analysisData?.detected_objects?.status ||
    (detections.length > 0 ? "completed" : "analyzed");

  // Determine image dimensions for bounding box relative calculation
  const imgWidth =
    analysisData?.image?.width ||
    analysisData?.detected_objects?.image_info?.width ||
    naturalDim.w ||
    800;

  const imgHeight =
    analysisData?.image?.height ||
    analysisData?.detected_objects?.image_info?.height ||
    naturalDim.h ||
    600;

  const handleImageLoad = (e) => {
    if (e.target.naturalWidth && e.target.naturalHeight) {
      setNaturalDim({
        w: e.target.naturalWidth,
        h: e.target.naturalHeight,
      });
    }
  };

  const handleAutoFillClick = () => {
    if (!onApplyRecommendation || detections.length === 0) return;
    const top = detections[0];
    const theme = getClassTheme(top.class_name);
    const titleVal = `${theme.label} reported near site`;
    const categoryVal = top.suggested_department || primaryDept || "Roads and Highways";
    const descVal = `${top.visual_issue || `Visual identification verified a ${theme.label.toLowerCase()} requiring municipal maintenance.`} Detected via automated YOLOv8 computer vision with ${Math.round((top.confidence || 0.85) * 100)}% confidence.${ocrText ? ` Nearby signboard indicates: "${ocrText}".` : ""}`;

    onApplyRecommendation({
      title: titleVal,
      category: categoryVal,
      description: descVal,
      priority: theme.priority,
    });
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#c3c6d1] overflow-hidden shadow-sm transition-all ${className}`}
    >
      {/* Component Header Bar */}
      <div className="bg-gradient-to-r from-[#001e40] to-[#0a3566] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <span className="material-symbols-outlined text-[20px] text-blue-300">
              smart_toy
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              {title}
              <span className="text-[10px] bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                {modelName}
              </span>
            </h3>
            <p className="text-[11px] text-blue-200 font-medium">
              Civic Object Detection &amp; Spatial Defect Localization
            </p>
          </div>
        </div>

        {/* Action Controls & Latency Badge */}
        <div className="flex items-center gap-2 text-xs">
          {latencyMs && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono text-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {typeof latencyMs === "number" ? `${latencyMs.toFixed(1)} ms` : latencyMs}
            </span>
          )}

          {detections.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors flex items-center gap-1 ${
                showBoxes
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white/10 text-blue-200 hover:bg-white/20"
              }`}
              title="Toggle Bounding Boxes"
            >
              <span className="material-symbols-outlined text-[15px]">
                {showBoxes ? "visibility" : "visibility_off"}
              </span>
              Boxes
            </button>
          )}

          {previewUrl && (
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-blue-200 transition-colors"
              title="Inspect Full Image"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Visual Viewport + Detection Analytics Panel */}
      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"} gap-0`}>
        {/* Left Column: Image Viewport with Bounding Box Overlays */}
        <div
          className={`${
            compact ? "w-full" : "lg:col-span-7"
          } bg-gray-900/95 relative flex items-center justify-center overflow-hidden min-h-[260px] p-2 select-none`}
        >
          {previewUrl ? (
            <div className="relative inline-block max-w-full max-h-[460px]">
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Civic evidence"
                onLoad={handleImageLoad}
                className="block max-w-full max-h-[460px] object-contain rounded-md shadow-inner"
              />

              {/* Bounding Box Overlays */}
              {showBoxes &&
                detections.map((det, idx) => {
                  if (!det.bbox) return null;
                  const theme = getClassTheme(det.class_name);
                  const isHovered = hoveredIdx === idx;

                  // Compute normalized percentage coordinates
                  const left = Math.max(0, Math.min(100, (det.bbox.x1 / imgWidth) * 100));
                  const top = Math.max(0, Math.min(100, (det.bbox.y1 / imgHeight) * 100));
                  const width = Math.max(
                    2,
                    Math.min(100 - left, ((det.bbox.x2 - det.bbox.x1) / imgWidth) * 100)
                  );
                  const height = Math.max(
                    2,
                    Math.min(100 - top, ((det.bbox.y2 - det.bbox.y1) / imgHeight) * 100)
                  );

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                      }}
                      className={`absolute border-2 ${theme.border} ${
                        isHovered
                          ? "ring-4 ring-white/70 bg-white/20 z-20 scale-[1.01]"
                          : `${theme.bg} z-10`
                      } transition-all duration-150 cursor-pointer rounded-sm group`}
                    >
                      {/* Label Tag on Top of Bounding Box */}
                      {showLabels && (
                        <div
                          className={`absolute -top-6 left-0 ${theme.tagBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1 z-30 pointer-events-none transform -translate-y-0.5`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {theme.icon}
                          </span>
                          <span>{det.class_name || theme.label}</span>
                          <span className="opacity-90 font-mono">
                            {Math.round((det.confidence || 0.85) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Status Badge overlay on image */}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-white/90 font-medium flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    detections.length > 0 ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span>
                  {detections.length > 0
                    ? `${detections.length} Civic Defect${detections.length > 1 ? "s" : ""} Located`
                    : status === "no_reliable_detection"
                    ? "No Structural Defects Detected"
                    : "Visual Inspection Verified"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center p-8">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-500">
                image_not_supported
              </span>
              <p className="text-xs">No visual evidence photograph attached.</p>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis Breakdown */}
        <div
          className={`${
            compact ? "w-full" : "lg:col-span-5"
          } p-5 flex flex-col justify-between bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200`}
        >
          <div className="space-y-4">
            {/* Top Summary Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Primary Routing Analysis
                </span>
                <span className="text-sm font-bold text-[#001e40]">
                  {primaryDept || "Roads and Infrastructure"}
                </span>
              </div>
              {primaryConf && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Confidence
                  </span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">
                    {Math.round(primaryConf * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Extracted Signboard / OCR Text (if present) */}
            {ocrText && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">
                    signpost
                  </span>
                  Signboard / Landmark OCR Text
                </div>
                <p className="text-xs font-mono text-amber-950 bg-white/70 p-2 rounded border border-amber-200/60 break-words">
                  "{ocrText}"
                </p>
              </div>
            )}

            {/* Detected Civic Objects List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Visual Defect Classification</span>
                <span className="text-gray-400 font-normal text-[11px]">
                  {detections.length} item{detections.length !== 1 ? "s" : ""}
                </span>
              </div>

              {detections.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {detections.map((det, idx) => {
                    const theme = getClassTheme(det.class_name);
                    const isHovered = hoveredIdx === idx;
                    const confPercent = Math.round((det.confidence || 0.85) * 100);

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                          isHovered
                            ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-300"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: theme.hex }}
                            />
                            {det.class_name ? det.class_name.toUpperCase() : theme.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${theme.pillBg} ${theme.text}`}
                          >
                            {theme.priority}
                          </span>
                        </div>

                        {/* Confidence Meter Bar */}
                        <div className="space-y-1 mb-1.5">
                          <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                            <span>Visual Match</span>
                            <span className="font-mono font-bold text-gray-700">
                              {confPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${confPercent}%`,
                                backgroundColor: theme.hex,
                              }}
                            />
                          </div>
                        </div>

                        {det.visual_issue && (
                          <p className="text-[11px] text-gray-600 leading-snug">
                            {det.visual_issue}
                          </p>
                        )}

                        {det.suggested_department && (
                          <div className="mt-1.5 text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-gray-400">
                              arrow_forward
                            </span>
                            Target: <span className="text-[#001e40]">{det.suggested_department}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-dashed border-gray-300 text-center text-xs text-gray-500">
                  <span className="material-symbols-outlined text-gray-400 text-2xl mb-1">
                    check_circle
                  </span>
                  <p className="font-semibold text-gray-700">No defects flagged</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Image meets standard municipal clearance thresholds or contains no recognizable road damages.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Action: Autofill Grievance Fields */}
          {onApplyRecommendation && detections.length > 0 && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={handleAutoFillClick}
                className="w-full py-2.5 px-3 bg-[#001e40] hover:bg-[#002f66] active:scale-[0.98] text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-yellow-300">
                  auto_fix_high
                </span>
                Autofill Grievance with AI Findings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zoom / Fullscreen Modal */}
      {isZoomed && previewUrl && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-xl overflow-hidden max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-700"
          >
            <div className="p-3 bg-gray-800 text-white flex justify-between items-center text-xs font-bold border-b border-gray-700">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">
                  visibility
                </span>
                High-Resolution AI Visual Inspection
              </span>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-1 hover:bg-gray-700 rounded text-gray-300"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Enlarged evidence"
                className="max-w-full max-h-[75vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
