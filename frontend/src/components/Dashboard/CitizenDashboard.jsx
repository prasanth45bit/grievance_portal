import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import NewComplaintForm from "./NewComplaintForm";
import CitizenProfile from "./CitizenProfile";
import GrievanceHistory from "./GrievanceHistory";
import GrievanceTracking from "./GrievanceTracking";
import AccountSettings from "./AccountSettings";
import NotificationCenter from "./NotificationCenter";

export default function CitizenDashboard({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard", "new-complaint", "profile", "history", "track", "settings", "notifications"

  const complaints = [
    {
      id: "#CP2024/9912",
      subject: "Water Leakage in Public Park",
      category: "Civic Amenities",
      status: "In Progress",
      date: "12 June 2024",
    },
    {
      id: "#CP2024/9845",
      subject: "Street Light Not Working",
      category: "Electricity",
      status: "Resolved",
      date: "08 June 2024",
    },
    {
      id: "#CP2024/9711",
      subject: "Incomplete Road Construction",
      category: "Roads & Transport",
      status: "Escalated",
      date: "02 June 2024",
    },
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    const value = search.toLowerCase();
    return (
      complaint.id.toLowerCase().includes(value) ||
      complaint.subject.toLowerCase().includes(value) ||
      complaint.category.toLowerCase().includes(value)
    );
  });

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Escalated") {
      return "bg-red-100 text-red-700";
    }
    return "bg-orange-100 text-orange-700";
  };

  const navItems = [
    { label: "Dashboard", icon: "dashboard", active: activeView === "dashboard" },
    { label: "New Complaint", icon: "add_box", active: activeView === "new-complaint" },
    { label: "History", icon: "history", active: activeView === "history" },
    { label: "Track", icon: "location_on", active: activeView === "track" },
    { label: "Notifications", icon: "notifications", active: activeView === "notifications" },
    { label: "Profile", icon: "person", active: activeView === "profile" },
    { label: "Settings", icon: "settings", active: activeView === "settings" },
  ];

  const handleNavItemClick = (label) => {
    if (label === "Dashboard") {
      setActiveView("dashboard");
    } else if (label === "New Complaint") {
      setActiveView("new-complaint");
    } else if (label === "Profile") {
      setActiveView("profile");
    } else if (label === "History") {
      setActiveView("history");
    } else if (label === "Track") {
      setActiveView("track");
    } else if (label === "Settings") {
      setActiveView("settings");
    } else if (label === "Notifications") {
      setActiveView("notifications");
    } else {
      console.log("Navigated to: " + label);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Panel */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        navItems={navItems}
        onNavItemClick={handleNavItemClick}
      />

      {/* Main Area */}
      <main className="md:ml-64 min-h-screen">
        {/* Top Header Navbar */}
        <TopNavbar
          search={search}
          setSearch={setSearch}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Dynamic Content Switching */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {activeView === "dashboard" ? (
            <>
              {/* ================= SUMMARY CARDS ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Grievances */}
                <div className="dashboard-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="stat-icon bg-primary text-white">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      +12% from last month
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Grievances
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900">24</h3>
                </div>

                {/* Pending */}
                <div className="dashboard-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="stat-icon bg-orange-500 text-white">
                      <span className="material-symbols-outlined">
                        pending_actions
                      </span>
                    </div>
                    <span className="text-xs font-bold text-orange-600">
                      Awaiting Action
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <h3 className="text-3xl font-bold text-gray-900">06</h3>
                </div>

                {/* Resolved */}
                <div className="dashboard-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="stat-icon bg-green-700 text-white">
                      <span className="material-symbols-outlined">task_alt</span>
                    </div>
                    <span className="text-xs font-bold text-green-700">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <h3 className="text-3xl font-bold text-gray-900">17</h3>
                </div>

                {/* Escalated */}
                <div className="dashboard-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="stat-icon bg-red-600 text-white">
                      <span className="material-symbols-outlined">
                        priority_high
                      </span>
                    </div>
                    <span className="text-xs font-bold text-red-600">
                      High Priority
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Escalated</p>
                  <h3 className="text-3xl font-bold text-gray-900">01</h3>
                </div>
              </div>

              {/* ================= TRENDS AND DISTRIBUTION ================= */}
              <div className="grid grid-cols-12 gap-6">
                {/* Trend Chart */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-300">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                      <h4 className="text-lg font-bold">Grievance Trends</h4>
                      <p className="text-xs text-gray-500">
                        Volume of complaints filed over the last 6 months
                      </p>
                    </div>
                    <select className="text-sm bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 outline-none">
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>

                  {/* Chart Bars */}
                  <div className="h-64 flex items-end justify-between gap-3 px-2">
                    {[
                      ["Jan", 40, 12],
                      ["Feb", 60, 18],
                      ["Mar", 45, 14],
                      ["Apr", 85, 24],
                      ["May", 55, 16],
                      ["Jun", 70, 21],
                    ].map(([month, height, value]) => (
                      <div
                        key={month}
                        className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                      >
                        <div className="relative w-full flex justify-center">
                          <div
                            className="w-full max-w-14 bg-primary rounded-t-lg opacity-85 hover:opacity-100 transition-all duration-300"
                            style={{ height: `${height}%` }}
                          />
                          <div className="absolute -top-9 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            {month}: {value}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-3 font-semibold">
                          {month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Status Distribution */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300">
                    <h4 className="text-lg font-bold mb-6">Status Distribution</h4>
                    <div className="flex justify-center py-4">
                      <div className="donut-chart">
                        <div className="donut-inner">
                          <span className="text-2xl font-bold">24</span>
                          <span className="text-[10px] uppercase font-bold text-gray-500">
                            Total
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-primary-container rounded-full" />
                          <span className="text-gray-600">Resolved</span>
                        </div>
                        <span className="font-bold">71%</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-orange-500 rounded-full" />
                          <span className="text-gray-600">Pending</span>
                        </div>
                        <span className="font-bold">25%</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-red-600 rounded-full" />
                          <span className="text-gray-600">Escalated</span>
                        </div>
                        <span className="font-bold">4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RECENT COMPLAINTS ================= */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
                <div className="p-6 border-b border-gray-300 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                  <div>
                    <h4 className="text-lg font-bold">Recent Complaints</h4>
                    <p className="text-xs text-gray-500">
                      Track your most recently filed grievances
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveView("history")}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    View All History
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-bold">Complaint ID</th>
                        <th className="px-6 py-4 font-bold">Subject</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold">Filed Date</th>
                        <th className="px-6 py-4 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((complaint) => (
                          <tr
                            key={complaint.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-bold text-primary whitespace-nowrap">
                              {complaint.id}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {complaint.subject}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {complaint.category}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`
                                  inline-flex items-center gap-2
                                  px-3 py-1
                                  rounded-full
                                  text-xs
                                  font-bold
                                  whitespace-nowrap
                                  ${getStatusStyle(complaint.status)}
                                `}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {complaint.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {complaint.date}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedComplaint(complaint)}
                                className="p-2 text-gray-500 hover:text-primary hover:scale-110 transition-all"
                              >
                                <span className="material-symbols-outlined">
                                  visibility
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-gray-500">
                            No complaints found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ================= FOOTER ================= */}
              <footer className="py-8 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500">
                <p className="text-xs">
                  © 2024 Department of Administrative Reforms & Public Grievances
                  (DARPG)
                </p>
                <div className="flex gap-5">
                  <a href="#" className="text-xs hover:text-primary">
                    RTI
                  </a>
                  <a href="#" className="text-xs hover:text-primary">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-xs hover:text-primary">
                    Terms & Conditions
                  </a>
                  <a href="#" className="text-xs hover:text-primary">
                    Help Desk
                  </a>
                  <a href="#" className="text-xs hover:text-primary">
                    Sitemap
                  </a>
                </div>
              </footer>
            </>
          ) : activeView === "new-complaint" ? (
            <NewComplaintForm onBackToDashboard={() => setActiveView("dashboard")} />
          ) : activeView === "profile" ? (
            <CitizenProfile onBackToDashboard={() => setActiveView("dashboard")} />
          ) : activeView === "history" ? (
            <GrievanceHistory onBackToDashboard={() => setActiveView("dashboard")} />
          ) : activeView === "track" ? (
            <GrievanceTracking onBackToDashboard={() => setActiveView("dashboard")} />
          ) : activeView === "settings" ? (
            <AccountSettings onBackToDashboard={() => setActiveView("dashboard")} />
          ) : (
            <NotificationCenter
              onBackToDashboard={() => setActiveView("dashboard")}
              onNavigate={(view) => setActiveView(view)}
            />
          )}
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setActiveView("new-complaint")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:hidden z-30"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* ================= COMPLAINT DETAIL MODAL ================= */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Complaint ID</p>
                <h3 className="text-xl font-bold text-primary">
                  {selectedComplaint.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="font-semibold mt-1">
                  {selectedComplaint.subject}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-semibold mt-1">
                  {selectedComplaint.category}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div>
                  <span
                    className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                      selectedComplaint.status
                    )}`}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Filed Date</p>
                <p className="font-semibold mt-1">{selectedComplaint.date}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-colors"
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
