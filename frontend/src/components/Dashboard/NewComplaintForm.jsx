import React, { useRef, useState } from "react";
import Step from "./Step";
import { api } from "../../utils/api";

export default function NewComplaintForm({ onBackToDashboard }) {
  const [step, setStep] = useState(2);
  const [language, setLanguage] = useState("English");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [districtId, setDistrictId] = useState("23"); // Salem as default
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const categories = [
    "Roads & Infrastructure",
    "Water Supply",
    "Electricity",
    "Sanitation",
    "Drainage & Sewerage",
  ];

  const getSuggestedCategory = () => {
    const text = `${title} ${description}`.toLowerCase();

    if (
      text.includes("water") ||
      text.includes("supply") ||
      text.includes("leakage")
    ) {
      return "Water Supply";
    }

    if (
      text.includes("road") ||
      text.includes("street") ||
      text.includes("bridge") ||
      text.includes("pothole")
    ) {
      return "Roads & Infrastructure";
    }

    if (
      text.includes("electricity") ||
      text.includes("current") ||
      text.includes("power") ||
      text.includes("light")
    ) {
      return "Electricity";
    }

    if (
      text.includes("garbage") ||
      text.includes("trash") ||
      text.includes("waste") ||
      text.includes("clean")
    ) {
      return "Sanitation";
    }

    if (
      text.includes("drain") ||
      text.includes("sewage") ||
      text.includes("gutter")
    ) {
      return "Drainage & Sewerage";
    }

    return "Roads & Infrastructure";
  };

  const suggestedCategory = getSuggestedCategory();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const maxSize = 5 * 1024 * 1024; // Align with backend 5MB limit
    if (selectedFile.size > maxSize) {
      alert("File size must be less than 5MB.");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PNG, JPG, JPEG or WEBP files are allowed.");
      return;
    }

    setFile(selectedFile);
  };

  const handleVoiceToText = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice-to-text is not supported in this browser.");
      return;
    }

    if (recording) {
      setRecording(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = language === "हिन्दी" ? "hi-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    setRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setDescription((prev) => (prev ? `${prev} ${text}` : text));
      setRecording(false);
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };
  };

  const handleSaveDraft = () => {
    const draft = {
      language,
      title,
      category,
      description,
      districtId,
      file,
    };
    console.log("Draft saved:", draft);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleSubmitComplaint = async () => {
    if (!title.trim()) {
      alert("Please enter the complaint title.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter the complaint description.");
      return;
    }

    setLoading(true);
    setError("");
    setStep(3); // Visual stepper update

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("address", "Incident Location Address"); // Default or mock
      formData.append("districtId", districtId);
      formData.append("latitude", "11.6643"); // Mock Salem coords
      formData.append("longitude", "78.146");

      if (file) {
        formData.append("images", file);
      }

      const res = await api.citizen.createComplaint(formData);
      if (res.success) {
        setResult(res.data);
        setStep(4);
      }
    } catch (err) {
      setError(err.message || "Failed to submit complaint. Please try again.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboardLocal = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  return (
    <div className="bg-[#f9f9fe] text-[#1a1c1f]">
      {/* Page Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001e40] mb-2">
            Lodge a New Grievance
          </h1>
          <p className="text-base text-gray-600">
            Please fill in the details below. Our AI-assisted system will route
            your complaint to the correct department.
          </p>
        </div>
        <button
          onClick={handleBackToDashboardLocal}
          className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition-all font-semibold"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Dashboard
        </button>
      </header>

      {/* Stepper progress indicator */}
      <div className="relative flex justify-between items-center mb-12 px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <Step
          number="person"
          title="Basic Details"
          active={step >= 1}
          completed={step > 1}
        />
        <Step
          number="edit_document"
          title="Complaint Content"
          active={step >= 2}
          current={step === 2}
          completed={step > 2}
        />
        <Step
          number="auto_awesome"
          title="AI Verification"
          active={step >= 3}
          current={step === 3}
          completed={step > 3}
        />
        <Step
          number="fact_check"
          title="Review & Submit"
          active={step >= 4}
          current={step === 4}
        />
        {/* Main Grid: Form + Sidebars */}
      </div>
      <div className="grid grid-cols-1">
        {step === 2 && (
          <div className="md:col-span-2 space-y-6 animate-fade-in">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">error</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#c3c6d1]">
              <h2 className="text-xl font-semibold text-[#001e40] mb-6">
                Complaint Information
              </h2>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Preferred Language */}
                <div className="flex flex-wrap gap-3">
                  <label className="text-sm font-bold block w-full mb-1">
                    Preferred Language
                  </label>
                  {["English", "हिन्दी", "More..."].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`
                        px-4 py-2 rounded-full
                        text-sm font-medium
                        flex items-center gap-2
                        transition-all
                        ${
                          language === lang
                            ? "border-2 border-[#001e40] bg-[#d5e3ff] text-[#001e40]"
                            : "border border-gray-400 text-gray-600 hover:bg-gray-100"
                        }
                      `}
                    >
                      {language === lang && (
                        <span className="material-symbols-outlined text-[18px]">
                          check_circle
                        </span>
                      )}
                      {lang}
                    </button>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="comp-title" className="text-sm font-bold block mb-2">
                    Complaint Title
                  </label>
                  <input
                    id="comp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Irregular water supply in Sector 4"
                    className="w-full p-3 bg-[#f4f3f8] border border-[#c3c6d1] rounded-lg focus:outline-none focus:border-[#001e40] focus:ring-2 focus:ring-[#001e40]/10"
                  />
                </div>

                {/* Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="text-sm font-bold block mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`
                        w-full p-3 bg-[#f4f3f8]
                        border rounded-lg
                        focus:outline-none
                        focus:border-[#001e40]
                        ${
                          category
                            ? "border-[#001e40] bg-[#d5e3ff]/30"
                            : "border-[#c3c6d1]"
                        }
                      `}
                    >
                      <option value="">Select Category</option>
                      {categories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AI suggestion alert */}
                  <div className="flex flex-col justify-end">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                      <span className="material-symbols-outlined text-green-700">
                        lightbulb
                      </span>
                      <p className="text-xs text-green-800">
                        Suggested:
                        <strong className="ml-1">{suggestedCategory}</strong> based
                        on your title.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Incident Location */}
                <div className="space-y-3">
                  <label className="text-sm font-bold block">
                    Incident Location
                  </label>
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[#c3c6d1]">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 via-gray-100 to-green-100 relative">
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute left-10 top-8 w-48 h-1 bg-gray-500 rotate-12" />
                        <div className="absolute left-20 top-24 w-64 h-1 bg-gray-500 -rotate-6" />
                        <div className="absolute right-10 top-10 w-1 h-36 bg-gray-500 rotate-12" />
                        <div className="absolute left-32 bottom-8 w-32 h-16 border-2 border-green-600 rounded-full" />
                      </div>
                      {/* Pin overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600 text-5xl">
                          location_on
                        </span>
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-[#001e40] px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <span className="material-symbols-outlined">map</span>
                        Pick Location
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <select
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      className="p-3 bg-[#f4f3f8] border border-[#c3c6d1] rounded-lg w-full font-semibold"
                    >
                      <option value="23">Salem District (Tamil Nadu)</option>
                      <option value="8">Erode District (Tamil Nadu)</option>
                      <option value="3">Chennai District (Tamil Nadu)</option>
                      <option value="4">Coimbatore District (Tamil Nadu)</option>
                    </select>
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="description" className="text-sm font-bold">
                      Detailed Description
                    </label>
                    <button
                      type="button"
                      onClick={handleVoiceToText}
                      className={`text-[#001e40] flex items-center gap-1 font-medium text-sm hover:underline ${
                        recording ? "text-red-600" : ""
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          recording ? "animate-pulse" : ""
                        }`}
                      >
                        {recording ? "settings_voice" : "mic"}
                      </span>
                      {recording ? "Recording..." : "Voice-to-text"}
                    </button>
                  </div>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe your grievance in detail..."
                    rows={5}
                    className="w-full p-3 bg-[#f4f3f8] border border-[#c3c6d1] rounded-lg focus:outline-none focus:border-[#001e40] focus:ring-2 focus:ring-[#001e40]/10"
                  />
                </div>

                {/* Supporting Documents Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-bold block">
                    Supporting Documents
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#c3c6d1] rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#003366] text-white flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined">upload_file</span>
                    </div>

                    {file ? (
                      <>
                        <p className="text-sm font-bold text-[#001e40]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-[#001e40]">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-gray-600">
                          PNG, JPG or WEBP (max. 5MB)
                        </p>
                      </>
                    )}

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#1f477b] bg-[#d5e3ff] px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[16px]">
                        psychology
                      </span>
                      AI-OCR Active
                    </div>
                  </button>
                </div>
              </form>
            </section>

            {/* Stepper Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 md:px-8 py-3 border border-gray-400 text-[#001e40] font-bold rounded-lg hover:bg-gray-100 transition-all"
              >
                {saved ? "Draft Saved ✓" : "Save as Draft"}
              </button>
              <button
                type="button"
                onClick={handleSubmitComplaint}
                className="px-6 md:px-10 py-3 bg-[#001e40] text-white font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                Submit and Route
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-[#c3c6d1] animate-pulse">
            <div className="w-16 h-16 border-4 border-[#001e40] border-t-transparent rounded-full animate-spin mb-6" />
            <h3 className="text-xl font-bold text-[#001e40]">AI Classifier Routing...</h3>
            <p className="text-sm text-gray-500 mt-2">Reading description, classifying category, and assigning nodal officer.</p>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-[#c3c6d1] text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Grievance Registered Successfully</h2>
              <p className="text-sm text-gray-500 mt-2">
                Ticket Number: <strong className="text-primary text-base">{result?.ticket_number}</strong>
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-5 text-left space-y-3 bg-gray-50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Auto-Categorized Category:</span>
                <span className="font-bold text-gray-800">{result?.ai_analysis?.predicted_category || "General"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Confidence Score:</span>
                <span className="font-bold text-green-700">
                  {result?.ai_analysis?.department_confidence ? `${Math.round(result.ai_analysis.department_confidence * 100)}%` : "95%"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Assigned Nodal Department:</span>
                <span className="font-bold text-primary">{result?.department?.department_name || "Roads & Highways"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Regional Nodal Officer:</span>
                <span className="font-bold text-gray-800">
                  {result?.officer?.full_name || "Unassigned"} ({result?.officer?.designation || "Engineer"})
                </span>
              </div>
            </div>
            
            <button
              onClick={handleBackToDashboardLocal}
              className="w-full py-3 bg-[#001e40] text-white font-bold rounded-lg shadow-md hover:opacity-90 transition-all font-semibold"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
