import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../utils/api";
import AIVisionResults from "../common/AIVisionResults";

export default function GrievanceHistory({ onBackToDashboard }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.citizen.getMyComplaints(1, 100, searchTerm);
      if (res.success && res.data) {
        const mapped = res.data.map((c) => ({
          raw: c,
          id: c.ticket_number,
          subject: c.title,
          category: c.department?.department_name || "General",
          date: new Date(c.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          status: c.status,
          description: c.description,
          priority: c.priority,
          district: c.district?.district_name || "Salem",
          officer: c.officer?.full_name || "Unassigned",
          aiSummary: c.ai_analysis?.ai_summary || null,
        }));
        setComplaints(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch grievance history:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredComplaints = complaints.filter((comp) => {
    if (!statusFilter) return true;
    const s = comp.status.toUpperCase();
    if (statusFilter === "resolved") {
      return s === "RESOLVED" || s === "CLOSED";
    } else if (statusFilter === "pending") {
      return ["SUBMITTED", "AI_ANALYZED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "ON_HOLD"].includes(s);
    } else if (statusFilter === "rejected") {
      return s === "REJECTED";
    }
    return true;
  });

  const totalFiled = complaints.length;
  const resolvedCount = complaints.filter((c) =>
    ["RESOLVED", "CLOSED"].includes(c.status.toUpperCase())
  ).length;
  const pendingCount = complaints.filter((c) =>
    ["SUBMITTED", "AI_ANALYZED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "ON_HOLD"].includes(c.status.toUpperCase())
  ).length;

  const getStatusBadgeStyle = (status) => {
    const s = status ? status.toUpperCase() : "";
    if (s === "RESOLVED" || s === "CLOSED") {
      return "bg-[#e6f4ea] text-[#137333] border border-[#ceead6]";
    }
    if (s === "REJECTED") {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    if (s === "ESCALATED") {
      return "bg-purple-100 text-purple-700 border border-purple-200";
    }
    return "bg-[#ffdcc2] text-[#2e1500] border border-orange-200";
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Grievance History</h2>
          <p className="text-sm text-gray-600 mt-1 font-semibold">
            Review and track the real-time status of your previously submitted complaints.
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition-all font-semibold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Dashboard
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Filed */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4 border border-[#c3c6d1]">
          <div className="w-12 h-12 rounded-full bg-[#001e40] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">folder_open</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Filed</p>
            <p className="text-2xl font-bold text-gray-900">{totalFiled}</p>
          </div>
        </div>

        {/* Successfully Resolved */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4 border border-[#c3c6d1]">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resolved / Closed</p>
            <p className="text-2xl font-bold text-green-700">{resolvedCount}</p>
          </div>
        </div>

        {/* Pending Action */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4 border border-[#c3c6d1]">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active In-Progress</p>
            <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d1] p-6 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:w-1/3">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none transition-all font-semibold"
            placeholder="Search by Ticket ID or Title..."
            type="text"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto py-2 px-4 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none cursor-pointer font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="resolved">Resolved / Closed</option>
            <option value="pending">Active In-Progress</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Ticket Number</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Subject</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Department</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Date Filed</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#001e40] border-t-transparent rounded-full animate-spin" />
                      Loading grievance history from database...
                    </div>
                  </td>
                </tr>
              ) : filteredComplaints.length > 0 ? (
                filteredComplaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6 text-sm font-bold text-[#001e40] font-mono">{comp.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-semibold max-w-xs truncate">{comp.subject}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{comp.category}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">{comp.date}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(comp.status)}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedComplaint(comp)}
                        className="text-[#001e40] hover:bg-gray-100 text-xs font-bold px-3 py-1.5 border border-[#c3c6d1] rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 font-semibold">
                    No grievances found in your history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-[#1a1c1f]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Grievance Ticket</p>
                <h3 className="text-xl font-bold text-[#001e40] font-mono">
                  {selectedComplaint.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-450 uppercase">Title</p>
                <p className="font-bold text-gray-850 mt-0.5">{selectedComplaint.subject}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-450 uppercase">Description</p>
                <p className="text-gray-700 mt-0.5 whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">Nodal Department</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">District</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedComplaint.district}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">Assigned Officer</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedComplaint.officer}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">Current Status</p>
                  <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeStyle(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              {selectedComplaint.aiSummary && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    AI Multi-Modal Analysis Summary
                  </p>
                  <p className="text-xs text-blue-800 mt-1">{selectedComplaint.aiSummary}</p>
                </div>
              )}

              {/* AI Visual Inspection Evidence */}
              {selectedComplaint.raw?.images && selectedComplaint.raw.images.length > 0 && (
                <div className="pt-2">
                  <AIVisionResults
                    imageSrc={selectedComplaint.raw.images[0].image_url}
                    analysisData={selectedComplaint.raw.ai_analysis}
                    title="Attached Evidence &amp; AI Detection"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2 bg-[#001e40] text-white rounded-lg font-bold hover:opacity-90 transition-opacity text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
