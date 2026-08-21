import React, { useState } from "react";

export default function GrievanceHistory({ onBackToDashboard }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const complaints = [
    {
      id: "2024/9912",
      subject: "Delay in PF Withdrawal",
      category: "EPFO",
      date: "Oct 12, 2024",
      status: "In Progress",
    },
    {
      id: "2024/8420",
      subject: "Potholes on Main Arterial Road",
      category: "Municipal Corp.",
      date: "Sep 05, 2024",
      status: "Resolved",
    },
    {
      id: "2023/1102",
      subject: "Water Supply Interruption",
      category: "Water Board",
      date: "Nov 22, 2023",
      status: "Closed",
    },
    {
      id: "2023/0855",
      subject: "Incomplete Document Submission",
      category: "Passport Office",
      date: "Aug 10, 2023",
      status: "Rejected",
    },
  ];

  const filteredComplaints = complaints.filter((comp) => {
    const matchesSearch =
      comp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "resolved") {
      matchesStatus = comp.status === "Resolved" || comp.status === "Closed";
    } else if (statusFilter === "pending") {
      matchesStatus = comp.status === "In Progress" || comp.status === "Pending";
    } else if (statusFilter === "rejected") {
      matchesStatus = comp.status === "Rejected";
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status) => {
    if (status === "Resolved" || status === "Closed") {
      return "bg-[#e6f4ea] text-[#137333] border border-[#ceead6]";
    }
    if (status === "Rejected") {
      return "bg-error-container text-error";
    }
    return "bg-secondary-container text-on-secondary-container";
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Grievance History</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and track the status of your previously submitted complaints.
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
        <div className="bg-white rounded-xl p-6 ambient-shadow flex items-center gap-4 border border-[#c3c6d1]">
          <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">folder_open</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Filed</p>
            <p className="text-2xl font-bold text-gray-900">14</p>
          </div>
        </div>

        {/* Successfully Resolved */}
        <div className="bg-white rounded-xl p-6 ambient-shadow flex items-center gap-4 border border-[#c3c6d1]">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Successfully Resolved</p>
            <p className="text-2xl font-bold text-gray-900">11</p>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white rounded-xl p-6 ambient-shadow flex items-center gap-4 border border-[#c3c6d1]">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Avg. Resolution Time</p>
            <p className="text-2xl font-bold text-gray-900">8.4 Days</p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl p-6 ambient-shadow border border-[#c3c6d1] flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:w-1/3">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            search
          </span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Search by ID or Subject..."
            type="text"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto py-2 px-4 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="resolved">Resolved / Closed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              calendar_month
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm outline-none cursor-pointer"
              placeholder="Date Range"
              readOnly
              type="text"
              onClick={() => console.log("Date range selector clicked")}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl ambient-shadow border border-[#c3c6d1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-500 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Complaint ID</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Subject</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Date Filed</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6 text-sm font-bold text-primary">{comp.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{comp.subject}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{comp.category}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{comp.date}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(comp.status)}`}>
                        {comp.status === "In Progress" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container animate-pulse"></span>
                        )}
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedComplaint(comp)}
                        className="text-primary hover:text-primary-container text-sm font-bold px-4 py-2 border border-primary rounded-lg hover:bg-primary-fixed-dim/10 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No complaints found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50">
          <span className="text-xs text-gray-500 font-semibold">
            Showing 1 to {filteredComplaints.length} of {filteredComplaints.length} entries
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50 text-xs" disabled>
              Prev
            </button>
            <button className="px-3 py-1 rounded-md bg-primary text-white font-bold text-xs">
              1
            </button>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-xs">
              2
            </button>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-xs">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in text-[#1a1c1f]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Grievance ID</p>
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
                <p className="text-xs text-gray-500 font-semibold">Subject</p>
                <p className="font-semibold mt-1 text-base">{selectedComplaint.subject}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold">Category / Nodal Department</p>
                <p className="font-semibold mt-1 text-base">{selectedComplaint.category}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold">Status</p>
                <div>
                  <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeStyle(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold">Filed Date</p>
                <p className="font-semibold mt-1 text-base">{selectedComplaint.date}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-colors text-sm"
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
