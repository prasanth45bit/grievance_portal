import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import CivicVisionInspector from "./CivicVisionInspector";
import AIVisionResults from "../common/AIVisionResults";

export default function AdminDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard', 'complaints', 'officers', 'reports', 'notifications', 'profile', 'settings'
  const [searchVal, setSearchVal] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Complaints filter states (matching HTML layout)
  const [filters, setFilters] = useState({
    search: "",
    district: "",
    priority: "",
    status: ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    district: "",
    priority: "",
    status: ""
  });

  // Officer search filter state
  const [officerSearch, setOfficerSearch] = useState("");

  // Create Officer modal toggle
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for creating new officer
  const [newOfficer, setNewOfficer] = useState({
    fullName: "",
    empId: "",
    email: "",
    phone: "",
    district: "",
    designation: "AE",
    status: "Active"
  });

  // Officers List state
  const [officers, setOfficers] = useState([]);

  // Admin complaints queue state
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic backend data states
  const [districtsList, setDistrictsList] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [districtReport, setDistrictReport] = useState([]);
  const [overviewReport, setOverviewReport] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  const [metrics, setMetrics] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    highPriorityComplaints: 0,
    resolutionPercentage: 0
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live districts from catalog
      try {
        const distRes = await api.common.getDistricts();
        if (distRes.success && distRes.data) {
          setDistrictsList(distRes.data);
        }
      } catch (err) {
        console.warn("Could not load catalog districts:", err);
      }

      // 2. Fetch admin profile
      try {
        const profRes = await api.admin.getProfile();
        if (profRes.success && profRes.data) {
          setAdminProfile(profRes.data);
          setProfileForm({
            fullName: profRes.data.full_name || "",
            phone: profRes.data.phone || ""
          });
        }
      } catch (err) {
        console.warn("Could not load admin profile:", err);
      }

      // 3. Fetch stats
      const statsRes = await api.admin.getDashboardStats();
      if (statsRes.success && statsRes.data) {
        setMetrics(statsRes.data.metrics);
      }

      // 4. Fetch district report for chart
      try {
        const repRes = await api.admin.getDistrictReport();
        if (repRes.success && repRes.data) {
          setDistrictReport(repRes.data);
        }
      } catch (err) {
        console.warn("Could not load district report:", err);
      }

      // 5. Fetch overview report
      try {
        const ovRes = await api.admin.getOverviewReport();
        if (ovRes.success && ovRes.data) {
          setOverviewReport(ovRes.data);
        }
      } catch (err) {
        console.warn("Could not load overview report:", err);
      }

      // 6. Fetch admin notifications
      try {
        const notifRes = await api.notifications.getNotifications();
        if (notifRes.success && notifRes.data) {
          setAdminNotifications(notifRes.data);
        }
      } catch (err) {
        console.warn("Could not load admin notifications:", err);
      }

      // 7. Fetch officers
      const officersRes = await api.admin.getOfficers();
      if (officersRes.success && officersRes.data) {
        const mappedOfficers = officersRes.data.map(o => ({
          id: o.employee_id,
          name: o.full_name,
          initials: o.full_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "AE",
          district: o.district?.district_name || "Assigned Jurisdiction",
          pending: o.complaints ? o.complaints.filter(c => ["SUBMITTED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(c.status)).length : 0,
          progress: o.complaints ? o.complaints.filter(c => c.status === "IN_PROGRESS").length : 0,
          resolved: o.complaints ? o.complaints.filter(c => ["RESOLVED", "CLOSED"].includes(c.status)).length : 0,
          workload: o.status === "ACTIVE" ? "Optimal" : "Inactive",
          bgClass: "bg-primary-container text-on-primary-container"
        }));
        setOfficers(mappedOfficers);
      }

      // 8. Fetch complaints
      const complaintsRes = await api.admin.getGrievances(1, 100);
      if (complaintsRes.success && complaintsRes.data) {
        const mappedComplaints = complaintsRes.data.map(c => ({
          complaint_id: c.complaint_id,
          id: c.ticket_number,
          subject: c.title,
          district: c.district?.district_name || "Assigned Jurisdiction",
          category: c.department?.department_name || "General",
          priority: c.priority === "CRITICAL" || c.priority === "HIGH" ? "High" : "Medium",
          assignedOfficer: c.officer?.full_name || "Unassigned",
          status: c.status,
          date: new Date(c.created_at).toLocaleDateString(),
          description: c.description,
          images: c.images || [],
          ai_analysis: c.ai_analysis || null,
          raw: c,
        }));
        setComplaints(mappedComplaints);
      }
    } catch (err) {
      console.error("Error loading admin dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeView]);

  const handleDownloadReport = (format) => {
    if (format === "CSV") {
      const headers = ["Ticket ID", "Subject", "District", "Category", "Priority", "Officer", "Status", "Date"];
      const rows = complaints.map(c => [
        `"${c.id}"`,
        `"${(c.subject || "").replace(/"/g, '""')}"`,
        `"${c.district}"`,
        `"${c.category}"`,
        `"${c.priority}"`,
        `"${c.assignedOfficer}"`,
        `"${c.status}"`,
        `"${c.date}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `department_grievances_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Report export generated for ${adminProfile?.department?.department_name || "Highways"} Department.`);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg("");
    try {
      const res = await api.admin.updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone
      });
      if (res.success) {
        setProfileSuccessMsg("Admin profile updated successfully!");
        setAdminProfile(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    if (!newOfficer.fullName || !newOfficer.empId || !newOfficer.email || !newOfficer.district || !newOfficer.designation) {
      alert("Please fill in all required fields to register the officer.");
      return;
    }

    try {
      const payload = {
        fullName: newOfficer.fullName,
        email: newOfficer.email,
        phone: newOfficer.phone || "9876543210",
        employeeId: newOfficer.empId,
        designation: newOfficer.designation,
        districtId: parseInt(newOfficer.district) || 23,
        password: "Password123"
      };

      const res = await api.admin.registerOfficer(payload);
      if (res.success) {
        alert("Officer registered successfully in database!");
        setIsModalOpen(false);
        setNewOfficer({
          fullName: "",
          empId: "",
          email: "",
          phone: "",
          district: "",
          designation: "AE",
          status: "Active"
        });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || "Failed to register officer. Please try again.");
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const filteredOfficers = officers.filter(o => {
    const term = officerSearch.toLowerCase();
    return (
      o.name.toLowerCase().includes(term) ||
      o.id.toLowerCase().includes(term) ||
      o.district.toLowerCase().includes(term)
    );
  });

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = !searchVal ||
      c.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.district.toLowerCase().includes(searchVal.toLowerCase());

    const matchesDistrict = !appliedFilters.district ||
      c.district.toLowerCase() === appliedFilters.district.toLowerCase();

    const matchesPriority = !appliedFilters.priority ||
      c.priority.toLowerCase() === appliedFilters.priority.toLowerCase();

    const matchesStatus = !appliedFilters.status ||
      c.status.toLowerCase().replace(" ", "_") === appliedFilters.status.toLowerCase();

    return matchesSearch && matchesDistrict && matchesPriority && matchesStatus;
  });

  return (
    <div className="bg-[#f9f9fe] text-[#1a1c1f] min-h-screen flex w-full">
      {/* Side Navigation */}
      <nav className="hidden md:flex flex-col py-6 gap-3 h-screen w-64 left-0 top-0 sticky bg-gray-100 border-r border-[#c3c6d1] z-20 shrink-0">
        {/* Brand Header */}
        <div className="px-6 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-105 text-primary flex items-center justify-center font-bold shadow-sm shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              assured_workload
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-primary truncate leading-tight">Admin Console</h1>
            <p className="text-[11px] text-gray-500 font-bold truncate mt-0.5">{adminProfile?.department?.department_name || "Highways"} Department</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 mb-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Report
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          <li
            onClick={() => setActiveView("dashboard")}
            className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg cursor-pointer transition-colors ${
              activeView === "dashboard"
                ? "bg-[#d5e3ff] text-[#001e40] font-bold"
                : "text-gray-650 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeView === "dashboard" ? "'FILL' 1" : "'FILL' 0" }}>
              dashboard
            </span>
            <span className="text-sm">Dashboard</span>
          </li>

          <li
            onClick={() => setActiveView("complaints")}
            className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg cursor-pointer transition-colors ${
              activeView === "complaints"
                ? "bg-[#fe9832] text-white font-bold"
                : "text-gray-650 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeView === "complaints" ? "'FILL' 1" : "'FILL' 0" }}>
              description
            </span>
            <span className="text-sm">Complaints</span>
          </li>

          <li
            onClick={() => setActiveView("officers")}
            className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg cursor-pointer transition-colors ${
              activeView === "officers"
                ? "bg-[#fe9832] text-white font-bold"
                : "text-gray-650 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeView === "officers" ? "'FILL' 1" : "'FILL' 0" }}>
              groups
            </span>
            <span className="text-sm">Officer Management</span>
          </li>

          <li
            onClick={() => setActiveView("reports")}
            className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg cursor-pointer transition-colors ${
              activeView === "reports"
                ? "bg-[#d5e3ff] text-[#001e40] font-bold"
                : "text-gray-655 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">description</span>
            <span className="text-sm">Reports</span>
          </li>

          <li
            onClick={() => setActiveView("vision-inspector")}
            className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg cursor-pointer transition-colors ${
              activeView === "vision-inspector"
                ? "bg-[#001e40] text-white font-bold"
                : "text-gray-655 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeView === "vision-inspector" ? "'FILL' 1" : "'FILL' 0" }}>
              document_scanner
            </span>
            <span className="text-sm">Vision AI Inspector</span>
          </li>

          <li
            onClick={() => setActiveView("notifications")}
            className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg cursor-pointer justify-between transition-colors ${
              activeView === "notifications"
                ? "bg-[#d5e3ff] text-[#001e40] font-bold"
                : "text-gray-655 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="text-sm">Notifications</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#fe9832]" />
          </li>

          <li
            onClick={() => setActiveView("profile")}
            className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg cursor-pointer transition-colors ${
              activeView === "profile"
                ? "bg-[#d5e3ff] text-[#001e40] font-bold"
                : "text-gray-655 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-sm">Profile</span>
          </li>
        </div>

        {/* Footer Links */}
        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-[#c3c6d1]/40 px-2">
          <li 
            onClick={() => setActiveView("settings")}
            className={`flex items-center gap-3 py-2.5 px-4 rounded-lg cursor-pointer transition-colors ${
              activeView === "settings"
                ? "bg-[#d5e3ff] text-[#001e40] font-bold"
                : "text-gray-650 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-xs font-semibold">Settings</span>
          </li>
          <li
            onClick={onLogout}
            className="flex items-center gap-3 py-2.5 px-4 text-red-650 hover:bg-red-50 rounded-lg cursor-pointer font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-xs">Sign Out</span>
          </li>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopNavBar */}
        <header className="flex justify-between items-center h-16 bg-white border-b border-[#c3c6d1] z-10 shadow-sm shrink-0 px-6">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-[#001e40] text-sm hidden md:block">CPGRAMS Officer Portal</h1>
            <h1 className="font-bold text-[#001e40] text-sm md:hidden">CPGRAMS</h1>
            <div className="hidden md:flex relative ml-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-gray-50 border border-[#c3c6d1] rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary"
                placeholder="Search grievance ID..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView("notifications")}
              className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-50 relative"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#fe9832] border-2 border-white" />
            </button>

            <button
              onClick={() => setActiveView("settings")}
              className={`text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-50 ${
                activeView === "settings" ? "bg-gray-100 text-primary" : ""
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>

            <div className="w-8 h-8 rounded-full border border-[#c3c6d1] overflow-hidden shrink-0">
              <img
                alt="Admin Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgYx9dfl7ZrPL9sCEm_GpLh4VSJ1Oimqw1-i16Gp_V-bVLYV8rimbfeBS0k-jwITG7Q9SSXpEAHNXIJHowAR6nofBxzGuR1v0u5wpi7MfQlJ-yiyPne4FsYvJQK5TrN2TizAqdPWHj4jrb7CD90Ot7WWHkKB5Gsso7kP9gu3hTp_UAB_VmDGQ0WsOkJ54Kmh_7IPpeGgN1oZIdDZriCe2TS1138qR1f5QGcvlVhJfjsut2IivkxhL99Q"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeView === "dashboard" ? (
            <>
              {/* Dashboard overview */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-3xl font-bold text-[#001e40] flex items-center gap-2">
                    Overview Dashboard
                    {loading && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">
                    {adminProfile?.department?.department_name || "Highways"} Department Status Report
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-white border border-[#c3c6d1] rounded-lg text-xs font-bold text-gray-650 flex items-center gap-1.5 shadow-sm hover:bg-gray-50">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    This Month
                  </button>
                  <button className="px-3 py-2 bg-white border border-[#c3c6d1] rounded-lg text-xs font-bold text-gray-650 flex items-center gap-1.5 shadow-sm hover:bg-gray-50">
                    <span className="material-symbols-outlined text-[16px]">filter_list</span>
                    Filter
                  </button>
                </div>
              </div>

              {/* Bento KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-4 border border-[#c3c6d1] flex flex-col justify-between shadow-sm hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-gray-500 text-[20px] mb-4">assignment</span>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{metrics.totalComplaints}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Total Complaints</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#c3c6d1] flex flex-col justify-between shadow-sm hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-4">fiber_new</span>
                  <div>
                    <div className="text-2xl font-bold text-primary">{Math.max(0, metrics.totalComplaints - metrics.resolvedComplaints)}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Active / Open</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#c3c6d1] flex flex-col justify-between shadow-sm hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-[#fe9832] text-[20px] mb-4">pending_actions</span>
                  <div>
                    <div className="text-2xl font-bold text-gray-850">{metrics.pendingComplaints}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Pending</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#c3c6d1] flex flex-col justify-between shadow-sm hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-green-655 text-[20px] mb-4">task_alt</span>
                  <div>
                    <div className="text-2xl font-bold text-gray-850">{metrics.resolvedComplaints}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Resolved</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#c3c6d1] flex flex-col justify-between shadow-sm hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-[#fe9832] text-[20px] mb-4 icon-fill">warning</span>
                  <div>
                    <div className="text-2xl font-bold text-[#fe9832]">{metrics.highPriorityComplaints}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">High Priority</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-red-200 flex flex-col justify-between shadow-sm hover:border-red-655 transition-colors">
                  <span className="material-symbols-outlined text-red-655 text-[20px] mb-4">alarm_off</span>
                  <div>
                    <div className="text-2xl font-bold text-red-655">{metrics.resolutionPercentage}%</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Resolved Rate</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-[#001e40]">Complaints by District</h3>
                    <span className="material-symbols-outlined text-gray-400 cursor-pointer">more_vert</span>
                  </div>
                  <div className="flex-grow flex items-end justify-between gap-2 h-48 border-b border-gray-200 pb-2 overflow-x-auto">
                    {(() => {
                      const chartData = districtReport.length > 0
                        ? districtReport.map(r => ({
                            l: r.district?.district_name || `Dist ${r.district_id}`,
                            v: parseInt(r.complaintsCount || r.dataValues?.complaintsCount || 0)
                          }))
                        : (() => {
                            const counts = {};
                            complaints.forEach(c => {
                              counts[c.district] = (counts[c.district] || 0) + 1;
                            });
                            const entries = Object.entries(counts);
                            if (entries.length > 0) {
                              return entries.map(([l, v]) => ({ l, v }));
                            }
                            return [
                              { l: "Salem", v: 0 },
                              { l: "Chennai", v: 0 },
                              { l: "Coimbatore", v: 0 },
                              { l: "Madurai", v: 0 },
                              { l: "Trichy", v: 0 }
                            ];
                          })();
                      const maxVal = Math.max(...chartData.map(d => d.v), 1);
                      return chartData.map((d, idx) => (
                        <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center group relative cursor-pointer">
                          <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {d.v} active
                          </div>
                          <div 
                            className="w-full bg-[#001e40] rounded-t-sm group-hover:bg-[#fe9832] transition-colors"
                            style={{ height: `${Math.max(Math.round((d.v / maxVal) * 100), 8)}%` }}
                          />
                          <span className="text-[10px] text-gray-500 font-bold mt-2 truncate w-full text-center">
                            {d.l}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-[#001e40]">Status Overview</h3>
                    <span className="material-symbols-outlined text-gray-400 cursor-pointer">more_vert</span>
                  </div>
                  <div className="flex-grow flex flex-col items-center justify-center relative py-2">
                    <div className="w-32 h-32 rounded-full border-[14px] border-l-green-650 border-t-red-650 border-r-[#fe9832] border-b-[#003366] flex flex-col items-center justify-center shadow-inner">
                      <span className="text-lg font-bold text-gray-850">84%</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Rate</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-6 text-[10px] font-bold text-gray-650">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-green-650 shrink-0" />
                        <span>Resolved (1045)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#fe9832] shrink-0" />
                        <span>In Progress (892)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#003366] shrink-0" />
                        <span>New (142)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-red-650 shrink-0" />
                        <span>Overdue (12)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trends & Priority Widget */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-[#001e40]">Monthly Trends</h3>
                    <div className="flex gap-3 text-[10px] font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-[#001e40]" /> Received
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-green-650" /> Resolved
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow h-40 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#f0f0f5" strokeWidth="1" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#f0f0f5" strokeWidth="1" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#f0f0f5" strokeWidth="1" />
                      <path d="M 10 100 Q 80 80, 150 70 T 290 40 T 390 15" fill="none" stroke="#001e40" strokeWidth="3" />
                      <path d="M 10 110 Q 80 90, 150 75 T 290 50 T 390 25" fill="none" stroke="#16a34a" strokeWidth="3" />
                      <text x="10" y="118" fill="#9ca3af" fontSize="9" fontWeight="bold">Jan</text>
                      <text x="90" y="118" fill="#9ca3af" fontSize="9" fontWeight="bold">Feb</text>
                      <text x="170" y="118" fill="#9ca3af" fontSize="9" fontWeight="bold">Mar</text>
                      <text x="250" y="118" fill="#9ca3af" fontSize="9" fontWeight="bold">Apr</text>
                      <text x="330" y="118" fill="#9ca3af" fontSize="9" fontWeight="bold">May</text>
                      <text x="375" y="118" fill="#9ca3af" fontSize="9" fontWeight="bold">Jun</text>
                    </svg>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#c3c6d1] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-[#c3c6d1] bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#fe9832] icon-fill text-[18px]">warning</span>
                      Priority Action Required
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-150">
                    {complaints.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedComplaint(c)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-primary">{c.id}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              c.priority === "Overdue"
                                ? "bg-red-50 text-red-700"
                                : c.priority === "Escalated"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {c.priority}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 line-clamp-1 mb-2">
                          {c.subject}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                          <span>{c.district} District</span>
                          <span>3 Days Ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-[#c3c6d1] bg-gray-50 text-center shrink-0">
                    <button
                      onClick={() => setActiveView("complaints")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View All (45)
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeView === "complaints" ? (
            <div className="space-y-6">
              {/* Page Header */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">Department Grievances</h2>
                <p className="text-xs text-gray-500 font-semibold">
                  Manage and monitor all complaints across districts under Highways Department.
                </p>
              </div>

              {/* Filters Card */}
              <div className="bg-white border border-[#c3c6d1] rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent pointer-events-none opacity-50" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-4 items-end">
                  <div className="flex-grow w-full">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Search Complaints</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                      <input 
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-xs focus:outline-none"
                        placeholder="Search by ID, title, or district..." 
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-48">
                    <label className="block text-xs font-bold text-gray-500 mb-1">District</label>
                    <select 
                      value={filters.district}
                      onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="">All Districts ({districtsList.length > 0 ? `${districtsList.length} Districts` : "Loading..."})</option>
                      {districtsList.map((d) => (
                        <option key={d.district_id} value={d.district_name}>
                          {d.district_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full lg:w-40">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Priority</label>
                    <select 
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="w-full lg:w-40">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleApplyFilters}
                    className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 h-[38px] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">filter_list</span>
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-[#c3c6d1] rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-gray-700 min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-[#c3c6d1] font-bold text-[#001e40]">
                      <tr>
                        <th className="py-3 px-4">Ticket ID</th>
                        <th className="py-3 px-4 min-w-[200px]">Complaint Title</th>
                        <th className="py-3 px-4">District</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Assigned Officer</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {filteredComplaints.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-primary">{c.id}</td>
                          <td className="py-4 px-4 text-gray-800 font-semibold">{c.subject}</td>
                          <td className="py-4 px-4 text-gray-650">{c.district}</td>
                          <td className="py-4 px-4 text-gray-650">{c.category}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.priority === "Critical"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : c.priority === "High"
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : c.priority === "Medium"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-650">{c.assignedOfficer}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === "Resolved"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : c.status === "In Progress"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : c.status === "Assigned"
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400">{c.date}</td>
                          <td className="py-4 px-4 text-right">
                            <button 
                              onClick={() => setSelectedComplaint(c)}
                              className="text-primary hover:text-opacity-80 p-1.5 rounded-full hover:bg-gray-150 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 border-t border-[#c3c6d1] p-4 flex items-center justify-between text-gray-400 font-semibold text-[10px]">
                  <span>Showing 1 to {filteredComplaints.length} of {complaints.length} entries</span>
                  <div className="flex gap-1">
                    <button className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <button className="p-1 rounded border border-gray-300 hover:bg-gray-100">
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === "officers" ? (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#001e40] mb-1">Officer Management</h2>
                  <p className="text-xs text-gray-500 font-semibold">
                    Manage department officers, view workload, and assign regions.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Create New Officer
                </button>
              </div>

              {/* Stats Overview Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-4 right-4 text-gray-100 shrink-0">
                    <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Active Officers</p>
                    <h3 className="text-3xl font-bold text-primary">{officers.length}</h3>
                  </div>
                  <div className="mt-4 flex items-center text-green-700 gap-1 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    <span>+3 this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-4 right-4 text-orange-100 shrink-0">
                    <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">High Workload Officers</p>
                    <h3 className="text-3xl font-bold text-gray-800">
                      {officers.filter(o => o.pending > 20).length}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center text-red-650 gap-1 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    <span>Requires attention</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-4 right-4 text-green-50 shrink-0">
                    <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Resolution Time</p>
                    <h3 className="text-3xl font-bold text-gray-800">
                      4.2 <span className="text-xs font-semibold text-gray-500">days</span>
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center text-green-700 gap-1 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">trending_down</span>
                    <span>Faster than last month</span>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-xl border border-[#c3c6d1] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#c3c6d1] flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50">
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                    <input 
                      value={officerSearch}
                      onChange={(e) => setOfficerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#c3c6d1] rounded-lg text-xs focus:outline-none bg-white" 
                      placeholder="Search by name, ID, or district..." 
                      type="text"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="px-3 py-2 border border-[#c3c6d1] rounded-lg text-gray-700 font-bold text-xs hover:bg-gray-100 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
                    </button>
                    <button 
                      onClick={() => handleDownloadReport("CSV")}
                      className="px-3 py-2 border border-[#c3c6d1] rounded-lg text-gray-700 font-bold text-xs hover:bg-gray-100 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span> Export
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px] text-xs font-semibold text-gray-700">
                    <thead className="bg-gray-50 border-b border-[#c3c6d1] font-bold text-[#001e40]">
                      <tr>
                        <th className="py-3 px-4">Officer Details</th>
                        <th className="py-3 px-4">District</th>
                        <th className="py-3 px-4 text-center">Pending</th>
                        <th className="py-3 px-4 text-center">In Progress</th>
                        <th className="py-3 px-4 text-center">Resolved</th>
                        <th className="py-3 px-4">Workload</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {filteredOfficers.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-[#001e40] bg-[#d5e3ff]`}>
                                {o.initials}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{o.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold font-mono">{o.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-800">{o.district}</td>
                          <td className={`py-4 px-4 text-center font-bold ${o.pending > 20 ? "text-red-650" : "text-gray-800"}`}>
                            {o.pending}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-650">{o.progress}</td>
                          <td className="py-4 px-4 text-center text-gray-650">{o.resolved}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              o.workload === "High"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : o.workload === "Optimal"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current`} />
                              {o.workload}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-gray-400 hover:text-primary p-1 rounded transition-colors">
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-[#c3c6d1] bg-gray-50 flex justify-between items-center text-gray-400 font-semibold text-[10px]">
                  <span>Showing 1 to {filteredOfficers.length} of {officers.length} entries</span>
                  <div className="flex gap-1">
                    <button className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <button className="p-1 rounded border border-gray-300 hover:bg-gray-100">
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === "reports" ? (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-gray-250 pb-4">
                <h2 className="text-2xl font-bold text-[#001e40]">Dispatched Reports</h2>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Export system audit logs and departmental grievance statistics summaries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#c3c6d1] rounded-xl p-4 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Total Grievances</div>
                  <div className="text-2xl font-bold text-primary mt-1">{overviewReport?.totalGrievances ?? metrics.totalComplaints}</div>
                </div>
                <div className="bg-white border border-[#c3c6d1] rounded-xl p-4 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Resolved Grievances</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">{overviewReport?.totalResolved ?? metrics.resolvedComplaints}</div>
                </div>
                <div className="bg-white border border-[#c3c6d1] rounded-xl p-4 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Resolution Rate</div>
                  <div className="text-2xl font-bold text-[#fe9832] mt-1">{overviewReport?.resolutionRate ?? metrics.resolutionPercentage}%</div>
                </div>
              </div>

              <div className="bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Monthly Redressal Summary</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Consolidated files containing all {adminProfile?.department?.department_name || "Highways"} department grievances registered across all {districtsList.length || 38} districts.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleDownloadReport("CSV")}
                      className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Export CSV ({complaints.length} Records)
                    </button>
                    <button
                      onClick={() => handleDownloadReport("PDF")}
                      className="border border-[#c3c6d1] text-gray-700 hover:bg-gray-100 text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      Export Summary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === "notifications" ? (
            <div className="space-y-6 max-w-2xl">
              <div className="border-b border-gray-250 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#001e40]">Admin Notifications</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    System logs, SLA thresholds, and escalations notifications.
                  </p>
                </div>
                {adminNotifications.length > 0 && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                    {adminNotifications.length} Alerts
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {adminNotifications.length > 0 ? (
                  adminNotifications.map((n) => (
                    <div 
                      key={n.notification_id} 
                      className={`bg-white border-l-4 ${!n.is_read ? "border-l-primary" : "border-l-gray-300"} border border-[#c3c6d1] p-4 rounded-xl shadow-sm`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-primary block uppercase">{n.title || "System Alert"}</span>
                        <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 mt-1">
                        {n.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 bg-white border border-[#c3c6d1] rounded-xl text-xs font-semibold">
                    No new system notifications or escalation alerts at this time.
                  </div>
                )}
              </div>
            </div>
          ) : activeView === "vision-inspector" ? (
            <div className="space-y-6">
              <CivicVisionInspector
                onBackToDashboard={() => setActiveView("dashboard")}
              />
            </div>
          ) : activeView === "profile" ? (
            <div className="max-w-2xl bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-150 pb-4">
                <div className="w-16 h-16 rounded-full border border-gray-300 overflow-hidden shrink-0">
                  <img
                    alt={adminProfile?.full_name || "Admin"}
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgYx9dfl7ZrPL9sCEm_GpLh4VSJ1Oimqw1-i16Gp_V-bVLYV8rimbfeBS0k-jwITG7Q9SSXpEAHNXIJHowAR6nofBxzGuR1v0u5wpi7MfQlJ-yiyPne4FsYvJQK5TrN2TizAqdPWHj4jrb7CD90Ot7WWHkKB5Gsso7kP9gu3hTp_UAB_VmDGQ0WsOkJ54Kmh_7IPpeGgN1oZIdDZriCe2TS1138qR1f5QGcvlVhJfjsut2IivkxhL99Q"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-850">{adminProfile?.full_name || "Department Admin"}</h2>
                  <p className="text-xs text-gray-505 font-bold uppercase tracking-wider mt-0.5">
                    {adminProfile?.department?.department_name || "Highways"} Department Admin
                  </p>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-semibold">
                  {profileSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-xs font-semibold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-xs font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 pt-2">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Email Account</span>
                    <span className="text-gray-800 font-bold">{adminProfile?.email || "admin@gov.in"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Assigned Department</span>
                    <span className="text-gray-855 font-bold">{adminProfile?.department?.department_name || "Roads and Highways"}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {profileSaving ? "Saving..." : "Save Profile Details"}
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-xl bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-150 pb-3">
                <h2 className="text-lg font-bold text-primary">System Preferences</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Audit Logs</span>
                    <span className="text-[10px] text-gray-400 leading-normal">Keep a detailed ledger of all officer actions.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Automatic SLA Escalations</span>
                    <span className="text-[10px] text-gray-400 leading-normal">Route overdue tickets directly to regional managers.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE OFFICER MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-[#c3c6d1] flex flex-col text-xs font-semibold">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#c3c6d1] bg-gray-50 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Create New Officer</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-450 hover:text-red-650"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateOfficer} className="p-6 overflow-y-auto space-y-4 max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newOfficer.fullName}
                    onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
                    placeholder="e.g., Anitha K" 
                    className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Employee ID</label>
                  <input 
                    required
                    type="text" 
                    value={newOfficer.empId}
                    onChange={(e) => setNewOfficer({ ...newOfficer, empId: e.target.value })}
                    placeholder="e.g., HW-7901" 
                    className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={newOfficer.email}
                    onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                    placeholder="officer@tn.gov.in" 
                    className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={newOfficer.phone}
                    onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                    placeholder="+91" 
                    className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Department</label>
                  <div className="relative flex items-center">
                    <input 
                      disabled
                      type="text" 
                      value={adminProfile?.department?.department_name || "Roads and Highways"} 
                      className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-150 text-gray-400 text-sm cursor-not-allowed"
                    />
                    <span className="material-symbols-outlined absolute right-3 text-gray-400 text-[18px]">lock</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Assigned District</label>
                  <select 
                    required
                    value={newOfficer.district}
                    onChange={(e) => setNewOfficer({ ...newOfficer, district: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select District ({districtsList.length} Available)</option>
                    {districtsList.map((d) => (
                      <option key={d.district_id} value={d.district_id}>
                        {d.district_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Designation</label>
                  <select 
                    required
                    value={newOfficer.designation}
                    onChange={(e) => setNewOfficer({ ...newOfficer, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c3c6d1] rounded-lg bg-gray-50 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Designation</option>
                    <option value="AE">Assistant Engineer (AE)</option>
                    <option value="ADE">Assistant Divisional Engineer (ADE)</option>
                    <option value="DE">Divisional Engineer (DE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Status</label>
                  <div className="flex gap-4 mt-2 font-bold text-gray-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status"
                        checked={newOfficer.status === "Active"}
                        onChange={() => setNewOfficer({ ...newOfficer, status: "Active" })}
                        className="text-primary focus:ring-primary"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status"
                        checked={newOfficer.status === "Inactive"}
                        onChange={() => setNewOfficer({ ...newOfficer, status: "Inactive" })}
                        className="text-primary focus:ring-primary"
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#c3c6d1] mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-400 text-gray-655 hover:bg-gray-150 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white hover:opacity-90 rounded-lg shadow-sm"
                >
                  Create Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL PANEL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in text-xs font-semibold">
            <div className="p-5 border-b border-gray-150 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <span className="font-bold text-primary text-sm">{selectedComplaint.id} Details</span>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4 text-gray-700">
              <div>
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Grievance Subject</span>
                <p className="mt-1 text-gray-850 font-semibold leading-relaxed">{selectedComplaint.subject}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">District</span>
                  <p className="mt-0.5 text-gray-800">{selectedComplaint.district}</p>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Priority Level</span>
                  <p className="mt-0.5 text-gray-800">{selectedComplaint.priority}</p>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Category</span>
                <p className="mt-0.5 text-gray-800">{selectedComplaint.category}</p>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Assigned Officer</span>
                <p className="mt-0.5 text-gray-800">{selectedComplaint.assignedOfficer}</p>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Status</span>
                <p className="mt-0.5 text-gray-800">{selectedComplaint.status}</p>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Complaint Description</span>
                <p className="mt-1 text-gray-850 font-semibold leading-relaxed whitespace-pre-line">{selectedComplaint.description}</p>
              </div>

              {/* Photographic Evidence & AI Vision Analysis */}
              {((selectedComplaint.images && selectedComplaint.images.length > 0) || (selectedComplaint.raw?.images && selectedComplaint.raw.images.length > 0)) && (
                <div className="pt-2">
                  <AIVisionResults
                    imageSrc={(selectedComplaint.images || selectedComplaint.raw?.images)[0].image_url}
                    analysisData={selectedComplaint.ai_analysis || selectedComplaint.raw?.ai_analysis}
                    title="AI Vision Inspection & Spatial Localization"
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-150 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedComplaint(null)} 
                className="bg-primary text-white px-4 py-2 rounded-lg font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
