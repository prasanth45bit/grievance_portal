import React, { useState } from "react";

export default function GrievanceTracking({ onBackToDashboard }) {
  const [searchInput, setSearchInput] = useState("CP2024/9912");
  const [trackedId, setTrackedId] = useState("CP2024/9912");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawn, setIsWithdrawn] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setTrackedId(searchInput.trim());
  };

  const isMatchedId =
    trackedId === "CP2024/9912" ||
    trackedId === "2024/9912" ||
    trackedId === "9876543210";

  const handleDownloadAck = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  const handleWithdrawConfirm = () => {
    setIsWithdrawn(true);
    setShowWithdrawModal(false);
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Track Your Grievance</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter your tracking details below to see the real-time status of your complaint.
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

      {/* Acknowledgment Download Banner Toast */}
      {downloadSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-green-700">check_circle</span>
          Acknowledgement download started successfully.
        </div>
      )}

      {/* Search Card Section */}
      <div className="bg-white rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.04)] border border-[#c3c6d1] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden mb-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <form onSubmit={handleTrackSubmit} className="w-full md:w-2/3 flex flex-col gap-2 relative z-10">
          <label className="text-sm font-bold text-gray-700" htmlFor="tracking-input">
            Complaint ID or Mobile Number
          </label>
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-[#c3c6d1] focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-base transition-all"
              id="tracking-input"
              placeholder="e.g. CP2024/0001 or 9876543210"
              type="text"
            />
          </div>
        </form>

        <div className="w-full md:w-1/3 relative z-10">
          <button
            onClick={handleTrackSubmit}
            className="w-full bg-[#001e40] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 h-[50px]"
          >
            Track Status
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {isMatchedId ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Summary & Quick Actions */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Quick Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#c3c6d1] p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Complaint ID
                  </div>
                  <div className="text-xl font-bold text-[#001e40]">#CP2024/9912</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    isWithdrawn
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-[#ffdcc2] text-[#2e1500]"
                  }`}
                >
                  {!isWithdrawn && (
                    <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                  )}
                  {isWithdrawn ? "Withdrawn" : "In-Progress"}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">
                    account_balance
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-gray-500">
                      Assigned Department
                    </div>
                    <div className="text-sm font-bold text-gray-800">
                      Ministry of Telecommunications
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">
                    calendar_today
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-gray-500">
                      Filing Date
                    </div>
                    <div className="text-sm font-bold text-gray-800">Oct 12, 2024</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">
                    category
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-gray-500">Category</div>
                    <div className="text-sm font-bold text-gray-800">
                      Network Deficiencies
                    </div>
                  </div>
                </div>
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
                  <span className="text-sm font-bold text-gray-800 text-left">
                    Download Acknowledgement
                  </span>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </button>

              <button
                onClick={() => console.log("Contact Helpdesk clicked")}
                className="bg-white border border-[#c3c6d1] rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined">support_agent</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-left">
                    Contact Helpdesk
                  </span>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-800 transition-colors">
                  chevron_right
                </span>
              </button>

              {!isWithdrawn && (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-white border border-red-200 rounded-xl p-4 flex items-center justify-between hover:bg-red-50 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined">cancel</span>
                    </div>
                    <span className="text-sm font-bold text-red-600 text-left">
                      Withdraw Complaint
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-red-400 group-hover:text-red-600 transition-colors">
                    chevron_right
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Progress Timeline */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-[#c3c6d1] p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">
              Grievance Journey
            </h2>

            <div className="relative pl-8 pb-6 flex-1">
              {/* Timeline Line (Background) */}
              <div className="absolute left-[15px] top-2 bottom-0 w-0.5 bg-gray-200" />
              {/* Timeline Line (Progress Indicator matching user journey status) */}
              <div
                className="absolute left-[15px] top-2 w-0.5 bg-green-600 rounded-full transition-all duration-500"
                style={{ height: isWithdrawn ? "10%" : "70%" }}
              />

              {/* Step 1: Submitted */}
              <div className="relative flex items-start gap-4 mb-8 group">
                <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border border-green-200">
                  <span className="material-symbols-outlined text-white text-[18px]">
                    check
                  </span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-transparent group-hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-gray-800">Submitted</h3>
                    <span className="text-xs text-gray-500">Oct 12, 09:30 AM</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Complaint successfully registered in the CPGRAMS portal.
                  </p>
                </div>
              </div>

              {/* Step 2: AI Classified */}
              <div className="relative flex items-start gap-4 mb-8 group">
                <div className={`absolute -left-[25px] w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border ${
                  isWithdrawn ? "bg-gray-100 border-gray-300" : "bg-green-600 border-green-200"
                }`}>
                  {isWithdrawn ? (
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                  ) : (
                    <span className="material-symbols-outlined text-white text-[18px]">
                      check
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-transparent group-hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-gray-800">AI Classified</h3>
                    <span className="text-xs text-gray-500">Oct 12, 09:35 AM</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Automated system categorized the grievance and identified the
                    nodal ministry.
                  </p>
                </div>
              </div>

              {/* Step 3: Assigned */}
              <div className="relative flex items-start gap-4 mb-8 group">
                <div className={`absolute -left-[25px] w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border ${
                  isWithdrawn ? "bg-gray-100 border-gray-300" : "bg-green-600 border-green-200"
                }`}>
                  {isWithdrawn ? (
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                  ) : (
                    <span className="material-symbols-outlined text-white text-[18px]">
                      check
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-transparent group-hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-gray-800">
                      Assigned to Nodal Officer
                    </h3>
                    <span className="text-xs text-gray-500">Oct 13, 11:15 AM</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Forwarded to Sri R.K. Sharma, Under Secretary, Ministry of
                    Telecommunications.
                  </p>
                </div>
              </div>

              {/* Step 4: Current Stage (Active) */}
              {!isWithdrawn ? (
                <div className="relative flex items-start gap-4 mb-8">
                  {/* Pulse Effect for Active Stage */}
                  <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-[#fe9832] flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border border-orange-200">
                    <span className="w-3 h-3 bg-white rounded-full animate-ping absolute opacity-75" />
                    <span className="w-2 h-2 bg-white rounded-full relative z-20" />
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 border-2 border-[#fe9832] shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ffdcc2]/20 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-800">
                          Investigation in Progress
                        </h3>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Since Oct 15
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                        The department has requested inputs from the regional telecom
                        provider regarding the reported outage.
                      </p>

                      {/* What's Next Box */}
                      <div className="bg-[#f4f3f8] rounded p-3 border-l-4 border-[#001e40]">
                        <div className="text-xs font-bold text-[#001e40] mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            info
                          </span>
                          What's Next?
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          Once the regional report is received, the nodal officer
                          will evaluate the findings and issue a resolution. Expected
                          completion time is 15-30 working days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-start gap-4 mb-8">
                  <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border border-red-200">
                    <span className="material-symbols-outlined text-white text-[16px]">
                      close
                    </span>
                  </div>
                  <div className="flex-1 bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="text-sm font-bold text-red-850">Complaint Withdrawn</h3>
                    <p className="text-xs text-red-700 mt-1">
                      You withdrew this grievance request. Sri R.K. Sharma has been
                      notified.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Pending */}
              <div className="relative flex items-start gap-4 opacity-50">
                <div className="absolute -left-[25px] w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-[0_0_0_4px_white] z-10 border border-gray-300">
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
                  <h3 className="text-sm font-bold text-gray-800">
                    Resolution & Closure
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Final action taken report will be provided here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-8 text-center ambient-shadow">
          <span className="material-symbols-outlined text-red-600 text-5xl mb-3">
            info_i
          </span>
          <h3 className="text-lg font-bold">No Matching Grievance Found</h3>
          <p className="text-sm text-red-700 mt-1 max-w-md mx-auto">
            We couldn't locate any active grievance with ID or Mobile matching{" "}
            <strong>"{trackedId}"</strong>. Please check your credentials and try
            again.
          </p>
        </div>
      )}

      {/* Withdrawal Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in text-[#1a1c1f]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-red-50">
              <div className="flex items-center gap-2 text-red-600">
                <span className="material-symbols-outlined">warning</span>
                <h3 className="text-lg font-bold">Withdraw Complaint</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 hover:bg-red-100 rounded-full text-red-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to withdraw grievance{" "}
                <strong>#CP2024/9912</strong>? This action will cancel Sri R.K.
                Sharma's investigation. <strong>This action cannot be undone.</strong>
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-750 transition-colors"
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
