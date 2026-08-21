import React, { useState } from "react";

export default function OfficerComplaints({ searchVal }) {
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionComments, setActionComments] = useState("");
  const [actionType, setActionType] = useState("Contractor Dispatched");
  const [toastMessage, setToastMessage] = useState(null);

  // Salem Highway complaints logs with detailed fields & log histories
  const [tickets, setTickets] = useState([
    {
      id: "#CPG-HW-001",
      title: "Pothole on Salem-Bengaluru Highway",
      category: "Road Repair",
      priority: "High",
      createdDate: "12 Oct 2023",
      deadline: "15 Oct 2023",
      status: "Open",
      location: "Salem-Bengaluru Highway, near Toll Plaza Omalur",
      coordinates: "11.7243° N, 78.0460° E",
      description:
        "Multiple large potholes causing accidents near the toll plaza. Requires immediate patching before monsoon. Heavy trucks and passenger vehicles are swerving dangerously to avoid the damaged section.",
      evidenceFile: "pothole_evidence_omalur.jpg",
      logs: [
        {
          time: "12 Oct 2023 09:15 AM",
          action: "Ticket Registered",
          detail: "Grievance auto-classified & routed to Salem Highways Department by AI Classifier.",
        },
        {
          time: "12 Oct 2023 11:30 AM",
          action: "Officer Assigned",
          detail: "Assigned to District Officer Ramesh Kumar for inspection and action.",
        },
      ],
    },
    {
      id: "#CPG-HW-002",
      title: "Damaged culvert near Mettur",
      category: "Bridge/Culvert",
      priority: "High",
      createdDate: "10 Oct 2023",
      deadline: "13 Oct 2023 (Overdue)",
      isOverdue: true,
      status: "In Progress",
      location: "Mettur Dam access road, near culvert #4",
      coordinates: "11.7865° N, 77.8012° E",
      description:
        "The side masonry walls of the culvert have collapsed, blocking partial water flow and undermining the roadway shoulder. Water is seeping into adjacent farmlands.",
      evidenceFile: "culvert_damage_mettur.pdf",
      logs: [
        {
          time: "10 Oct 2023 08:30 AM",
          action: "Grievance Filed",
          detail: "Filed by resident association of Mettur rural sector.",
        },
        {
          time: "10 Oct 2023 10:00 AM",
          action: "AI Routing Done",
          detail: "Routed directly to Bridge & Drainage cell, Salem.",
        },
        {
          time: "11 Oct 2023 02:15 PM",
          action: "Inspection Ordered",
          detail: "District Nodal Officer ordered pre-monsoon survey. Status updated to In Progress.",
        },
      ],
    },
    {
      id: "#CPG-HW-003",
      title: "Missing signage on Omalur bypass",
      category: "Signage",
      priority: "Low",
      createdDate: "05 Oct 2023",
      deadline: "20 Oct 2023",
      status: "Resolved",
      location: "Omalur bypass, Highway division road junction",
      coordinates: "11.7311° N, 78.0725° E",
      description:
        "The warning signboards for the sharp curve on the bypass are missing, creating speed hazards during night travel.",
      evidenceFile: "signage_missing_location.jpg",
      logs: [
        {
          time: "05 Oct 2023 10:10 AM",
          action: "Ticket Registered",
          detail: "Ticket classified as Low Priority Signage issue.",
        },
        {
          time: "06 Oct 2023 09:00 AM",
          action: "Contractor Dispatched",
          detail: "Signboards replacement order sent to local contractor.",
        },
        {
          time: "08 Oct 2023 04:00 PM",
          action: "Status Updated: Resolved",
          detail: "Contractor completed mounting new reflective curve indicators. Verified & closed.",
        },
      ],
    },
  ]);

  // Handle Export button
  const handleExport = () => {
    setToastMessage("Salem district highway grievances exported successfully to CSV.");
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Open Detailed Grievance Panel
  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setActionComments("");
    setActionType(
      ticket.status === "In Progress"
        ? "Status Updated: Resolved"
        : "Contractor Dispatched"
    );
  };


  // Submit action handler
  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!actionComments.trim()) {
      alert("Please enter comments detailing the action taken.");
      return;
    }

    let nextStatus = "In Progress";
    if (actionType === "Status Updated: Resolved") {
      nextStatus = "Resolved";
    }

    const currentFormattedTime = new Date().toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newLogItem = {
      time: currentFormattedTime,
      action: actionType,
      detail: actionComments,
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: nextStatus,
            isOverdue: nextStatus === "Resolved" ? false : t.isOverdue,
            deadline:
              nextStatus === "Resolved"
                ? t.deadline.replace(" (Overdue)", "")
                : t.deadline,
            logs: [newLogItem, ...t.logs],
          };
        }
        return t;
      })
    );

    setToastMessage(`Grievance ${selectedTicket.id} updated with action logs.`);
    setSelectedTicket(null);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      t.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      t.category.toLowerCase().includes(searchVal.toLowerCase());

    const matchesStatus =
      statusFilter === "All Statuses" || t.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All Priorities" || t.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === "All Categories" || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-error-container text-on-error-container border border-error/20";
    }
    if (priority === "Medium") {
      return "bg-secondary-container text-on-secondary-container border border-secondary/20";
    }
    return "bg-surface-variant text-on-surface-variant border border-outline-variant";
  };

  const getStatusBadgeStyle = (status) => {
    if (status === "Resolved") {
      return "bg-green-100 text-green-700";
    }
    if (status === "In Progress") {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-orange-100 text-orange-700";
  };

  // Switch between List View and Detailed Console View
  if (selectedTicket) {
    return (
      <div className=" rounded-xl border border-[#c3c6d1] shadow-sm overflow-hidden text-[#1a1c1f] animate-fade-in">
        {/* Detail View Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTicket(null)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center text-gray-600"
              aria-label="Back to grievances grid"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#001e40]">
                  Grievance Profile: {selectedTicket.id}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeStyle(
                    selectedTicket.status
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {selectedTicket.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-semibold">
                Highways Department | District Salem Console
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedTicket(null)}
            className="text-xs font-bold border border-gray-400 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Back to List
          </button>
        </div>

        {/* Detail Panel grid layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-gray-200">
          {/* LEFT COLUMN: Grievance Details Profile */}
          <div className="xl:col-span-7 p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                Grievance Title & Core Description
              </h4>
              <h5 className="text-lg font-bold text-[#001e40] mb-2">
                {selectedTicket.title}
              </h5>
              <p className="text-sm text-gray-650 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                {selectedTicket.description}
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  Category
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {selectedTicket.category}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  Priority
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${getPriorityStyle(
                    selectedTicket.priority
                  )}`}
                >
                  {selectedTicket.priority}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  Created Date
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  {selectedTicket.createdDate}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  SLA Deadline
                </span>
                <span
                  className={`text-xs font-semibold ${
                    selectedTicket.isOverdue ? "text-red-650 font-bold" : "text-gray-800"
                  }`}
                >
                  {selectedTicket.deadline}
                </span>
              </div>
            </div>

            {/* Geographical Map Preview Stub */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  map
                </span>
                Location & Coordinates
              </h4>
              <p className="text-xs text-gray-600 mb-2 font-semibold">
                {selectedTicket.location} (<strong>{selectedTicket.coordinates}</strong>)
              </p>
              {/* SVG / Map preview stub container */}
              <div className="h-40 bg-[#eeedf2] rounded-xl border border-[#c3c6d1] flex items-center justify-center relative overflow-hidden">
                {/* SVG Mock Map Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                <div className="z-10 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-red-600 text-3xl animate-bounce">
                    location_on
                  </span>
                  <span className="text-[11px] font-bold text-gray-700 bg-white/80 px-2 py-0.5 rounded shadow-sm mt-1">
                    Omalur Highway Coordinates
                  </span>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  attachment
                </span>
                Citizen Uploaded Evidence
              </h4>
              <div className="flex items-center gap-3 p-3 border border-[#c3c6d1] rounded-lg bg-gray-50 w-full sm:w-80">
                <span className="material-symbols-outlined text-[#001e40] text-3xl">
                  image
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {selectedTicket.evidenceFile}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    JPEG Image • 2.4 MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => console.log("Evidence download clicked")}
                  className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600"
                  title="Download File"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    download
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Redressal Actions Form & History Timeline */}
          <div className="xl:col-span-5 p-6 space-y-6 bg-gray-50">
            {selectedTicket.status === "Resolved" ? (
              /* Resolved Read-only Log summary */
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                  Grievance Redressed
                </h4>
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-medium space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-green-700 text-[18px]">
                      verified
                    </span>
                    Resolved & Closed
                  </p>
                  <p>
                    All required patchworks or masonry fixes have been completed.
                    Road quality inspectors have cleared this ticket from the active highway queue.
                  </p>
                </div>
              </div>
            ) : (
              /* Action Submission Form */
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                  Take Redressal Action
                </h4>

                <form onSubmit={handleActionSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-xs font-bold text-gray-700 mb-1"
                      htmlFor="action-directive"
                    >
                      Action / Resolution Directive
                    </label>
                    <select
                      id="action-directive"
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001e40] bg-white text-xs text-gray-800 font-semibold"
                    >
                      <option value="Contractor Dispatched">Contractor Dispatched</option>
                      <option value="Inspection Ordered">Inspection Ordered</option>
                      <option value="Status Updated: Resolved">Resolved & Closed</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-bold text-gray-700 mb-1"
                      htmlFor="action-comments"
                    >
                      Report Comments / Instructions
                    </label>
                    <textarea
                      id="action-comments"
                      rows={4}
                      value={actionComments}
                      onChange={(e) => setActionComments(e.target.value)}
                      placeholder="Write Nodal Action details, dispatched crew contractor info, or inspection survey parameters..."
                      className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001e40] bg-white text-xs text-gray-800 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Supporting Report Upload Stub */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Upload Completion Report (Optional)
                    </label>
                    <div className="border border-dashed border-[#c3c6d1] hover:bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                      <span className="material-symbols-outlined text-gray-400 text-3xl mb-1">
                        upload_file
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        Choose PDF report or photos
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      className="flex-1 bg-[#001e40] text-white py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Submit Nodal Action
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Action History Timeline */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Action History Log
              </h4>

              <div className="relative border-l-2 border-gray-200 ml-3 space-y-5 py-1">
                {selectedTicket.logs.map((log, index) => (
                  <div key={index} className="relative pl-5">
                    <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#001e40] border-2 border-white" />
                    <p className="text-xs font-bold text-[#001e40]">{log.action}</p>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40] mb-1">
            District Grievances
          </h2>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
            <span className="material-symbols-outlined text-[18px]">
              location_on
            </span>
            <span>Highways Department | Salem District</span>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-150 transition-colors font-bold text-sm shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          Export
        </button>
      </div>

      {/* Success alert banner toast */}
      {toastMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-green-700">
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Filters Box */}
      <div className="bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status select */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-[#c3c6d1] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#001e40] focus:border-[#001e40] outline-none"
            >
              <option>All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>

          {/* Priority select */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-gray-50 border border-[#c3c6d1] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#001e40] focus:border-[#001e40] outline-none"
            >
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Category select */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-50 border border-[#c3c6d1] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#001e40] focus:border-[#001e40] outline-none"
            >
              <option>All Categories</option>
              <option>Road Repair</option>
              <option>Bridge/Culvert</option>
              <option>Signage</option>
            </select>
          </div>

          {/* Date range picker stub */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Date Range
            </label>
            <input
              className="w-full bg-gray-50 border border-[#c3c6d1] rounded-lg px-3 py-2 text-sm outline-none"
              type="date"
              onClick={() => console.log("Complaints date picker clicked")}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#c3c6d1] shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-[#c3c6d1]/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 font-bold">Ticket ID</th>
                <th className="p-4 font-bold">Complaint Title</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Priority</th>
                <th className="p-4 font-bold">Created Date</th>
                <th className="p-4 font-bold">Deadline (SLA)</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-[#001e40]">{ticket.id}</td>
                    <td className="p-4 font-semibold text-gray-900">
                      {ticket.title}
                    </td>
                    <td className="p-4 text-gray-600">{ticket.category}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${getPriorityStyle(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{ticket.createdDate}</td>
                    <td
                      className={`p-4 ${
                        ticket.isOverdue
                          ? "text-red-650 font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      {ticket.deadline}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(
                          ticket.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {ticket.status === "Resolved" ? (
                        <button
                          onClick={() => handleOpenModal(ticket)}
                          className="px-4 py-1.5 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold"
                        >
                          View
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenModal(ticket)}
                          className="px-4 py-1.5 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-xs font-bold"
                        >
                          {ticket.status === "In Progress" ? "Update" : "Take Action"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-400">
                    No Salem highway grievances found matching search queries or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-4 border-t border-[#c3c6d1]/50 bg-gray-50 flex items-center justify-between text-gray-500 text-xs font-semibold">
          <span>Showing 1 to {filteredTickets.length} of {filteredTickets.length} entries</span>
          <div className="flex gap-2">
            <button className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center" disabled>
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button className="px-2.5 py-1 rounded bg-[#001e40] text-white">
              1
            </button>
            <button className="p-1 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
