import React, { useState, useRef } from "react";
import { api } from "../../utils/api";
import AIVisionResults from "../common/AIVisionResults";

export default function CivicVisionInspector({ onBackToDashboard, onLodgeComplaint }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [confidence, setConfidence] = useState(0.35);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const processImageFile = async (file, threshold = confidence) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit. Please upload a smaller image.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported format. Please upload JPEG, PNG, or WEBP.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError("");
    setLoading(true);

    try {
      const res = await api.common.analyzeImage(file, threshold);
      if (res.success && res.data) {
        setAnalysisResult(res.data);
      } else {
        setError(res.message || "Failed to analyze image with vision model.");
      }
    } catch (err) {
      console.error("AI Vision analysis failed:", err);
      setError(
        err.message || "Visual inference service is unreachable. Ensure ai-service is running on port 8001."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleThresholdChange = (newVal) => {
    setConfidence(newVal);
    if (selectedFile) {
      processImageFile(selectedFile, newVal);
    }
  };

  const handleLodgeComplaintClick = () => {
    if (onLodgeComplaint) {
      onLodgeComplaint({
        file: selectedFile,
        analysis: analysisResult,
      });
    } else if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  return (
    <div className="bg-[#f9f9fe] text-[#1a1c1f] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-[#001e40] rounded-lg">
              <span className="material-symbols-outlined text-[22px]">
                document_scanner
              </span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#001e40]">
              AI Civic Vision Scanner
            </h2>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Inspect civic defects in real-time with YOLOv8 Computer Vision &amp; OCR landmark extraction.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Control Strip & Threshold Adjuster */}
      <div className="bg-white p-5 rounded-xl border border-[#c3c6d1] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        {/* Confidence Threshold Slider */}
        <div className="flex-1 max-w-md space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">
                tune
              </span>
              Detection Confidence Threshold
            </span>
            <span className="text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.85"
            step="0.05"
            value={confidence}
            onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
            className="w-full accent-[#001e40] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
            <span>High Sensitivity (10%)</span>
            <span>Balanced (35%)</span>
            <span>Strict Verification (85%)</span>
          </div>
        </div>

        {/* Model Specs Pill */}
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Active Vision Model
            </span>
            <span className="font-bold text-[#001e40] font-mono">road_damage_yolov8n</span>
          </div>
          <div className="border-l border-gray-200 pl-4">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Inference Hardware
            </span>
            <span className="font-semibold text-gray-700">CPU Torch 2.1</span>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragOver
            ? "border-blue-600 bg-blue-50/70 scale-[1.01]"
            : "border-[#c3c6d1] bg-white hover:bg-gray-50 shadow-sm"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-full bg-blue-100 text-[#001e40] flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
        </div>

        <h3 className="text-sm font-bold text-[#001e40]">
          Drag and drop any civic photograph here, or click to browse
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Supports Potholes, Road Cracks, Open Manholes, Garbage Dumps, Water Leaks (PNG, JPG, WEBP &le; 5MB)
        </p>

        {selectedFile && (
          <div className="mt-4 flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#001e40] px-3 py-1.5 rounded-full text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-green-600">
              check_circle
            </span>
            <span>{selectedFile.name}</span>
            <span className="text-gray-500">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-8 rounded-xl border border-[#c3c6d1] shadow-sm text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#001e40] border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-[#001e40]">
            Running Computer Vision Inference...
          </h4>
          <p className="text-xs text-gray-500">
            Preprocessing image pixels, localizing bounding boxes, and extracting text features.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Interactive AI Results View */}
      {analysisResult && (
        <div className="space-y-4">
          <AIVisionResults
            imageSrc={previewUrl}
            analysisData={analysisResult}
            title="Real-Time Computer Vision Results"
          />

          {/* Action Row */}
          <div className="bg-white p-5 rounded-xl border border-[#c3c6d1] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Ready to file a formal municipal ticket with this evidence?
              </h4>
              <p className="text-xs text-gray-500">
                AI will pre-fill the recommended department ({analysisResult.primary_department || "Roads & Highways"}) and attach this visual inspection.
              </p>
            </div>

            <button
              onClick={handleLodgeComplaintClick}
              className="px-6 py-3 bg-[#001e40] hover:bg-[#002f66] active:scale-95 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <span>Lodge Grievance with this Inspection</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
