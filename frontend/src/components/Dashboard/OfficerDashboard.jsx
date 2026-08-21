import React, { useState } from "react";
import OfficerComplaints from "./OfficerComplaints";
import OfficerNotifications from "./OfficerNotifications";
import OfficerSettings from "./OfficerSettings";
import OfficerProfile from "./OfficerProfile";

export default function OfficerDashboard({ onLogout }) {
  const [searchVal, setSearchVal] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionComments, setActionComments] = useState("");
  const [actionType, setActionType] = useState("Contract Dispatched");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard", "complaints", "notifications", "settings", "profile"

  // Dynamic Metrics states
  const [metrics, setMetrics] = useState({
    assigned: 248,
    new: 32,
    progress: 156,
    priority: 14,
    overdue: 8,
  });

  // Salem High Priority Complaints List
  const [complaints, setComplaints] = useState([
    {
      id: "SAL-HW-0921",
      overdueText: "2 Days Overdue",
      isOverdue: true,
      title: "Severe Potholes on Omalur Main Road",
      description:
        "Multiple large potholes causing accidents near the toll plaza. Requires immediate patching before monsoon.",
      statusColor: "text-error",
      statusIcon: "schedule",
    },
    {
      id: "SAL-HW-0935",
      overdueText: "Due Today",
      isOverdue: false,
      title: "Bridge Expansion Joint Failure - Yercaud Foothills",
      description:
        "The metal expansion joint on bridge #42 has detached, creating a severe hazard for two-wheelers.",
      statusColor: "text-secondary",
      statusIcon: "timer",
    },
  ]);

  // Timeline logs
  const [timeline, setTimeline] = useState([
    {
      id: "log-1",
      type: "Status Updated: Resolved",
      detail: "SAL-HW-0850 • Attur Bypass",
      time: "10 mins ago",
      icon: "check",
      bgClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
    {
      id: "log-2",
      type: "New Assignment",
      detail: "SAL-HW-0941 • Mettur Road",
      time: "45 mins ago",
      icon: "add",
      bgClass: "bg-blue-100 text-blue-800",
    },
    {
      id: "log-3",
      type: "Contractor Dispatched",
      detail: "SAL-HW-0912 • Steel Plant Rd",
      time: "2 hours ago",
      icon: "sync",
      bgClass: "bg-orange-100 text-orange-800",
    },
  ]);

  // Filter complaints based on search value
  const filteredComplaints = complaints.filter((comp) => {
    const val = searchVal.toLowerCase();
    return (
      comp.id.toLowerCase().includes(val) ||
      comp.title.toLowerCase().includes(val) ||
      comp.description.toLowerCase().includes(val)
    );
  });

  const handleOpenActionModal = (comp) => {
    setSelectedComplaint(comp);
    setActionComments("");
    setActionType("Contractor Dispatched");
  };

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!actionComments.trim()) {
      alert("Please enter action comments.");
      return;
    }

    // Process submission:
    // 1. Remove from High Priority Complaints List
    setComplaints((prev) => prev.filter((c) => c.id !== selectedComplaint.id));

    // 2. Add log entry to Timeline
    const newLog = {
      id: "log-" + Date.now(),
      type: actionType,
      detail: `${selectedComplaint.id} • ${actionComments}`,
      time: "Just now",
      icon: actionType.includes("Resolved") ? "check" : "sync",
      bgClass: actionType.includes("Resolved")
        ? "bg-tertiary-fixed text-on-tertiary-fixed"
        : "bg-orange-100 text-orange-850",
    };
    setTimeline((prev) => [newLog, ...prev]);

    // 3. Decrement priority count in metrics
    setMetrics((prev) => ({
      ...prev,
      priority: Math.max(0, prev.priority - 1),
      progress: actionType.includes("Resolved")
        ? Math.max(0, prev.progress - 1)
        : prev.progress,
      overdue: selectedComplaint.isOverdue
        ? Math.max(0, prev.overdue - 1)
        : prev.overdue,
    }));

    // Clean up and show success feedback toast
    setSelectedComplaint(null);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <div className="bg-[#f9f9fe] text-[#1a1c1f] min-h-screen flex w-full">
      {/* Left Navigation Drawer */}
      <nav className="hidden md:flex h-screen w-64 left-0 top-0 sticky bg-surface-container dark:bg-surface-container-low border-r border-[#c3c6d1] flex-col py-6 gap-3 flex-shrink-0 z-20">
        <div className="px-4 pb-4 flex items-center gap-2 border-b border-[#c3c6d1]/50">
          <img
            alt="Government of India Emblem"
            className="w-8 h-8 object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkpnmLyyEHsKO088zzLR8Ujh5WpcNpprorx4Nu6U-c6wO2bn1HvPemrENgOhrSCPJ0aJe6WfiOoSlIc0Z637sB4cLHYcSbMrlOTArIPz2bZgZ8f4qaLpfhlGBOuJcPkjrA74R2Ccn1yexXOxea8tGP6hvtnPMH4hfimmfO5MQO2tZZK7ZClW9wo97ovPgOT648fIoaKbj1WpffpO_GsE4cCXq3MJtVBTWYFzMe5mD4QP0BNqma_zJRhg"
          />
          <div>
            <h1 className="font-bold text-[#001e40] text-base leading-tight">
              Officer Console
            </h1>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              Grievance Redressal
            </p>
          </div>
        </div>

        <ul className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto mt-4">
          <li
            onClick={() => setActiveView("dashboard")}
            className={`font-bold rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer ${
              activeView === "dashboard"
                ? "bg-[#d5e3ff] text-[#001e40]"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined icon-fill text-[20px]">
              dashboard
            </span>
            <span className="text-sm">Dashboard</span>
          </li>
          <li
            onClick={() => setActiveView("complaints")}
            className={`font-bold rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer ${
              activeView === "complaints"
                ? "bg-[#d5e3ff] text-[#001e40]"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">assignment</span>
            <span className="text-sm">Complaints</span>
          </li>
          <li
            onClick={() => setActiveView("notifications")}
            className={`font-bold rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer justify-between ${
              activeView === "notifications"
                ? "bg-[#d5e3ff] text-[#001e40]"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
              <span className="text-sm">Notifications</span>
            </span>
            <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-[9px] font-bold">
              3
            </span>
          </li>
          <li
            onClick={() => setActiveView("profile")}
            className={`font-bold rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
              activeView === "profile"
                ? "bg-[#d5e3ff] text-[#001e40]"
                : "text-gray-650 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-sm">Profile</span>
          </li>
          </ul>
               <div className="mt-auto px-2 border-t border-[#c3c6d1]/40 pt-4">
               
          <ul className="flex flex-col gap-1">
            <li className="text-gray-600 hover:bg-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="text-xs font-semibold">Help Center</span>
            </li>
            <li
              onClick={() => setActiveView("settings")}
              className={`font-semibold rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors ${
                activeView === "settings"
                  ? "bg-[#d5e3ff] text-[#001e40]"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-xs">Settings</span>
            </li>
            <li
              onClick={onLogout}
              className="text-red-650 hover:bg-red-50 rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-xs">Sign Out</span>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f3f8]">
        {/* TopNavBar */}
        <header className="w-full bg-white border-b border-[#c3c6d1] shadow-sm flex justify-between items-center h-16 px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-[#001e40]">
              CPGRAMS Officer Portal
            </h1>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md mx-6 flex items-center bg-gray-50 rounded-full px-4 py-1.5 border border-[#c3c6d1] focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-gray-500 text-[20px] mr-2">
              search
            </span>
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-500"
              placeholder="Search highways grievance ID or title..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              onClick={() => setActiveView("settings")}
              className={`hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 ${
                activeView === "settings" ? "text-primary bg-gray-100" : "text-gray-500"
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 flex items-center gap-1 font-semibold text-xs">
              <span className="material-symbols-outlined text-[18px]">language</span>
              <span>EN</span>
            </button>

            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#c3c6d1] cursor-pointer">
              <img
                alt="Officer Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9ugwUUZ6AcV9GaPZ_fKGbynI9m5e8ELQE59mnw-MUJ0KOLsozL_fQabkWFhjXx0iF8e23W3R2iglwVJdmxVkVvTmlO1tqViBtWzcKZJhMXh6QQzoOeGrQIDyEiqzocOrDZjWulzSVrN4JcutWOAdHjMxdbUETJs5TgdyDlwpy8zcMjc0QyyRr6lhYo42gq-mRLd1QVOEWlzecgSZKttAUH94BdjGItqbZssJr1_imtG_d9QqcGcISvA"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeView === "dashboard" ? (
            <>
              {/* Success action banner toast */}
              {showSuccessToast && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
                  <span className="material-symbols-outlined text-green-700">
                    check_circle
                  </span>
                  Officer action submitted and recorded in Salem highway logs.
                </div>
              )}

              {/* Officer Identity Anchor */}
              <section className="bg-white rounded-xl p-6 ambient-shadow border border-[#c3c6d1] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 opacity-30 rounded-bl-full -z-10" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#001e40]">Ramesh Kumar</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      District Officer{" "}
                      <span className="text-gray-300 mx-1">|</span> Highways Department{" "}
                      <span className="text-gray-300 mx-1">|</span> Salem District
                    </p>
                  </div>
                  <div className="bg-[#ffdcc2] text-[#2e1500] px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold border border-orange-200 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">
                      visibility
                    </span>
                    Viewing Salem District Only
                  </div>
                </div>
              </section>

              {/* Priority Metrics Bento Grid */}
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Total Assigned */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#c3c6d1] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <span className="material-symbols-outlined text-[18px]">
                      inventory_2
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Total Assigned
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#001e40]">
                    {metrics.assigned}
                  </div>
                </div>

                {/* New */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#c3c6d1] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <span className="material-symbols-outlined text-[18px] text-blue-500">
                      fiber_new
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      New
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#001e40]">{metrics.new}</div>
                </div>

                {/* In Progress */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#c3c6d1] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <span className="material-symbols-outlined text-[18px] text-orange-500">
                      autorenew
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      In Progress
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#001e40]">
                    {metrics.progress}
                  </div>
                </div>

                {/* High Priority */}
                <div className="bg-red-50 rounded-xl p-4 md:p-6 shadow-sm border border-red-200 flex flex-col justify-between hover:shadow-md transition-shadow col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      High Priority
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{metrics.priority}</div>
                </div>

                {/* Overdue */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-[#c3c6d1] flex flex-col justify-between hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <span className="material-symbols-outlined text-[18px]">
                      schedule
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Overdue
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#001e40]">
                    {metrics.overdue}
                  </div>
                </div>
              </section>

              {/* Workspace Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* High Priority Salem Queue */}
                <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#c3c6d1] overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-base font-bold text-red-650 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">
                        priority_high
                      </span>
                      High Priority Complaints - Salem
                    </h3>
                    <span className="text-xs font-semibold text-gray-500">
                      {filteredComplaints.length} Action Items
                    </span>
                  </div>

                  <div className="p-6 flex-grow space-y-4 max-h-[500px] overflow-y-auto">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((comp) => (
                        <div
                          key={comp.id}
                          className="bg-white border border-red-200 rounded-lg p-4 hover:bg-gray-50 transition-colors shadow-sm border-l-4 border-l-red-600"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold bg-gray-150 text-gray-600 px-2 py-0.5 rounded">
                              ID: {comp.id}
                            </span>
                            <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">
                                {comp.statusIcon}
                              </span>
                              {comp.overdueText}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-800 mb-1">
                            {comp.title}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed mb-3">
                            {comp.description}
                          </p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleOpenActionModal(comp)}
                              className="bg-red-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-red-750 transition-colors shadow-sm"
                            >
                              Take Action
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-400 text-sm">
                        No high-priority highway complaints found matching search query.
                      </div>
                    )}
                  </div>
                </section>

                {/* Salem Recent Activity Timeline */}
                <section className="bg-white rounded-xl shadow-sm border border-[#c3c6d1] overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-base font-bold text-[#001e40] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">
                        history
                      </span>
                      Recent Activity
                    </h3>
                  </div>

                  <div className="p-6 flex-grow overflow-y-auto max-h-[500px]">
                    <div className="relative border-l-2 border-gray-200 ml-4 space-y-6 py-2">
                      {timeline.map((log) => (
                        <div key={log.id} className="relative pl-6">
                          <span
                            className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${log.bgClass}`}
                          >
                            <span className="material-symbols-outlined text-[9px] font-bold">
                              {log.icon}
                            </span>
                          </span>
                          <p className="text-xs font-bold text-[#001e40]">{log.type}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                            {log.detail}
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">
                            {log.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : activeView === "complaints" ? (
            <OfficerComplaints searchVal={searchVal} />
          ) : activeView === "notifications" ? (
            <OfficerNotifications
              onNavigateToComplaint={(id) => {
                setActiveView("complaints");
                setSearchVal(id);
              }}
            />
          ) : activeView === "profile" ? (
            <OfficerProfile onBackToDashboard={() => setActiveView("dashboard")} />
          ) : (
            <OfficerSettings onBackToDashboard={() => setActiveView("dashboard")} />
          )}
          </div>
      </main>

      {/* TAKE ACTION MODAL PANEL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in text-[#1a1c1f]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Officer Action Portal
                </p>
                <h3 className="text-lg font-bold text-[#001e40]">
                  Grievance ID: {selectedComplaint.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500">Complaint Title</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {selectedComplaint.title}
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-gray-700 mb-1"
                  htmlFor="action-type"
                >
                  Select Action / Directive
                </label>
                <select
                  id="action-type"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-xs"
                >
                  <option value="Contractor Dispatched">Contractor Dispatched</option>
                  <option value="Inspection Ordered">Inspection Ordered</option>
                  <option value="Status Updated: Resolved">Resolved & Closed</option>
                  <option value="Reassigned Nodal Officer">Reassign Nodal Officer</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-gray-700 mb-1"
                  htmlFor="action-comments"
                >
                  Action Log Comments
                </label>
                <textarea
                  id="action-comments"
                  rows={3}
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Enter comments about dispatched teams, regional inspection parameters, or resolution details..."
                  className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-250">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-750 transition-colors shadow-sm"
                >
                  Submit Officer Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
