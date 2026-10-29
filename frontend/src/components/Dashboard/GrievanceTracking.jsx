import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import AIVisionResults from "../common/AIVisionResults";

export default function GrievanceTracking({ onBackToDashboard }) {
  const [searchInput, setSearchInput] = useState("GRV-2026-001245");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawRemarks, setWithdrawRemarks] = useState("");
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fetchTracking = async (ticket) => {
    if (!ticket) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.common.trackComplaint(ticket);
      if (res.success && res.data) {
        setComplaint(res.data);
        setIsWithdrawn(res.data.status === "CLOSED" || res.data.status === "REJECTED");
      } else {
        setComplaint(null);
        setError(res.message || `No grievance ticket found for '${ticket}'`);
      }
    } catch (err) {
      setComplaint(null);
      setError(err.message || `Could not find grievance ticket '${ticket}'. Please verify the ticket number.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking("GRV-2026-001245");
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    fetchTracking(searchInput.trim());
  };

  const handleDownloadAck = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  const handleWithdrawConfirm = async () => {
    if (!complaint) return;
    try {
      const res = await api.citizen.withdrawComplaint(complaint.complaint_id, withdrawRemarks);
      if (res.success) {
        setIsWithdrawn(true);
        setShowWithdrawModal(false);
        // Refresh tracking data
        fetchTracking(complaint.ticket_number);
      }
    } catch (err) {
      alert(err.message || "Failed to withdraw complaint. Ensure you are authorized.");
    }
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Track Your Grievance</h2>
          <p className="text-sm text-gray-600 mt-1 font-semibold">
            Enter your tracking ticket number below to see live, real-time status and journey progression.
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition-all font-bold text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </button>
      </div>

      {/* Acknowledgment Download Banner Toast */}
      {downloadSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-semibold">
          <span className="material-symbols-outlined text-green-700">check_circle</span>
          Official CPGRAMS acknowledgement receipt downloaded successfully.
        </div>
      )}

      {/* Search Card Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d1] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden mb-8">
        <form onSubmit={handleTrackSubmit} className="w-full md:w-2/3 flex flex-col gap-2 relative z-10">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="tracking-input">
            Ticket Number
          </label>
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#001e40] transition-colors">
              search
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-[#c3c6d1] focus:border-[#001e40] focus:ring-2 focus:ring-[#001e40]/10 outline-none text-sm font-semibold transition-all"
              id="tracking-input"
              placeholder="e.g. GRV-2026-001245"
              type="text"
            />
          </div>
        </form>

        <div className="w-full md:w-1/3 relative z-10">
          <button
            onClick={handleTrackSubmit}
            disabled={loading}
            className="w-full bg-[#001e40] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 h-[50px] text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                Track Status
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl mb-8 flex items-center gap-2 text-sm font-semibold">
          <span className="material-symbols-outlined text-red-600">error</span>
          {error}
        </div>
      )}

      {/* Results View */}
      {complaint && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Summary & Quick Actions */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Quick Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d1] p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-gray-150 pb-4">
                <div>
                  <div className="text-xs font-bold text-gray-450 uppercase tracking-wider mb-1">
                    Ticket Number
                  </div>
                  <div className="text-xl font-bold text-[#001e40] font-mono">
                    {complaint.ticket_number}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    isWithdrawn
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : complaint.status === "RESOLVED" || complaint.status === "CLOSED"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-[#ffdcc2] text-[#2e1500] border border-orange-200"
                  }`}
                >
                  {!isWithdrawn && complaint.status !== "RESOLVED" && complaint.status !== "CLOSED" && (
                    <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                  )}
                  {complaint.status}
                </span>
              </div>

              <div className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                    account_balance
                  </span>
                  <div>
                    <div className="text-[10px] text-gray-450 uppercase font-bold">Assigned Department</div>
                    <div className="text-sm font-bold text-gray-800 mt-0.5">
                      {complaint.department?.department_name || "General Administration"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                    location_on
                  </span>
                  <div>
                    <div className="text-[10px] text-gray-450 uppercase font-bold">District / Jurisdiction</div>
                    <div className="text-sm font-bold text-gray-800 mt-0.5">
                      {complaint.district?.district_name || "Salem"}, Tamil Nadu
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                    calendar_today
                  </span>
                  <div>
                    <div className="text-[10px] text-gray-450 uppercase font-bold">Filing Date</div>
                    <div className="text-sm font-bold text-gray-800 mt-0.5">
                      {new Date(complaint.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {complaint.officer && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                      badge
                    </span>
                    <div>
                      <div className="text-[10px] text-gray-450 uppercase font-bold">Nodal Officer</div>
                      <div className="text-sm font-bold text-gray-800 mt-0.5">
                        {complaint.officer.full_name} ({complaint.officer.designation})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Bento */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleDownloadAck}
                className="bg-white border border-[#c3c6d1] rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#d5e3ff] flex items-center justify-center text-[#001e40] group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined">download</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 text-left">
                    Download Official Receipt
                  </span>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-[18px]">
                  chevron_right
                </span>
              </button>

              {!isWithdrawn && complaint.status !== "RESOLVED" && complaint.status !== "CLOSED" && (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-white border border-red-200 rounded-xl p-4 flex items-center justify-between hover:bg-red-50 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined">cancel</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 text-left">
                      Withdraw Grievance
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-red-400 group-hover:text-red-600 transition-colors text-[18px]">
                    chevron_right
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Progress Timeline */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-[#c3c6d1] p-6 md:p-8 flex flex-col">
            <h2 className="text-base font-bold text-[#001e40] mb-6 border-b border-gray-150 pb-3">
              Live Grievance Journey &amp; Audit Trail
            </h2>

            <div className="relative pl-8 pb-6 flex-1">
              <div className="absolute left-[15px] top-2 bottom-0 w-0.5 bg-gray-200" />

              {/* Step 1: Submission */}
              <div className="relative flex items-start gap-4 mb-8 group">
                <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border border-green-200">
                  <span className="material-symbols-outlined text-white text-[18px]">check</span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-gray-850">Grievance Submitted</h3>
                    <span className="text-xs text-gray-500 font-semibold">
                      {new Date(complaint.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Ticket {complaint.ticket_number} successfully registered in portal. Title: "{complaint.title}"
                  </p>
                </div>
              </div>

              {/* Step 2: AI Multi-Modal Classification */}
              <div className="relative flex items-start gap-4 mb-8 group">
                <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border border-green-200">
                  <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-gray-850">AI Vision &amp; Text Analysis</h3>
                    <span className="text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                      Confidence: {complaint.ai_analysis?.department_confidence ? `${(complaint.ai_analysis.department_confidence * 100).toFixed(0)}%` : "Verified"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {complaint.ai_analysis?.ai_summary || `AI Multi-Modal classifier automatically routed this grievance to ${complaint.department?.department_name || "the nodal department"}.`}
                  </p>
                </div>
              </div>

              {/* Step 3: Status History Trail */}
              {complaint.status_history && complaint.status_history.length > 0 ? (
                complaint.status_history.map((hist, idx) => (
                  <div key={hist.history_id || idx} className="relative flex items-start gap-4 mb-8">
                    <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-[#001e40] flex items-center justify-center shadow-[0_0_0_4px_white] z-10 text-white">
                      <span className="material-symbols-outlined text-[16px]">update</span>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4 border border-[#c3c6d1] shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-bold text-[#001e40]">
                          Status Changed: {hist.new_status}
                        </h3>
                        <span className="text-[10px] text-gray-500 font-bold">
                          {new Date(hist.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1 font-semibold">
                        {hist.remarks || `Status transitioned from ${hist.old_status} to ${hist.new_status}.`}
                      </p>
                      <p className="text-[10px] text-gray-450 mt-1 uppercase font-bold">
                        Updated By: {hist.changed_by_role}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative flex items-start gap-4 mb-8">
                  <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-[#fe9832] flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border border-orange-200">
                    <span className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 border-2 border-[#fe9832] shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800">Assigned for Processing</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Your ticket has been assigned to the concerned engineering officer and is pending physical site verification.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Photographic Evidence and Bounding Box Analysis */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="lg:col-span-12">
              <AIVisionResults
                imageSrc={complaint.images[0].image_url}
                analysisData={complaint.ai_analysis}
                title="Citizen Evidence Photo &amp; AI Computer Vision Inspection"
              />
            </div>
          )}
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in text-[#1a1c1f]">
            <h3 className="text-lg font-bold text-red-600 mb-2">Withdraw Grievance</h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed font-semibold">
              Are you sure you want to withdraw grievance #{complaint.ticket_number}? This action will close the ticket in the system.
            </p>
            <textarea
              rows={3}
              placeholder="Reason for withdrawal (optional)..."
              value={withdrawRemarks}
              onChange={(e) => setWithdrawRemarks(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-[#c3c6d1] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
