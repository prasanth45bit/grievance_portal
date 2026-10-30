import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";

export default function OfficerNotifications({ onNavigateToComplaint, officerProfile }) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.getNotifications();
      if (res.success && res.data && res.data.length > 0) {
        const mapped = res.data.map((n) => ({
          id: n.notification_id,
          ticketId: n.complaint_id ? `#GRV-${n.complaint_id}` : "#SYS",
          type: n.title,
          time: new Date(n.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
          text: n.message,
          isUnread: !n.is_read,
          category: n.title?.includes("Assignment") ? "New Assignments" : "SLA Warnings",
          icon: n.title?.includes("Assignment") ? "assignment_add" : "notifications",
          bgClass: !n.is_read ? "bg-[#ffdcc2] text-[#2e1500]" : "bg-gray-100 text-gray-700",
          borderClass: !n.is_read ? "border-l-4 border-l-[#fe9832]" : "border border-gray-200",
        }));
        setNotifs(mapped);
      } else {
        setNotifs([]);
      }
    } catch (err) {
      console.warn("Failed to load notifications from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
    } catch (e) {
      // ignore
    }
    setNotifs((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, isUnread: false };
        }
        return n;
      })
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const unreadCount = notifs.filter((n) => n.isUnread).length;

  const filteredNotifs = notifs.filter((n) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Unread") return n.isUnread;
    if (selectedFilter === "New Assignments") return n.category === "New Assignments";
    if (selectedFilter === "SLA Warnings") return n.category === "SLA Warnings";
    return true;
  });

  return (
    <div className=" text-on-surface mx-auto">
      {/* Page Header & Scope Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-3xl icon-fill">
              notifications
            </span>
            <h2 className="text-3xl font-bold text-primary">Notifications</h2>
          </div>
          <p className="text-sm text-gray-500 font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">badge</span>
            {officerProfile?.department?.department_name || "Highways"} Department | {officerProfile?.district?.district_name || "Assigned"} District
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 ? (
            <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse" />
              {unreadCount} Unread Alerts
            </span>
          ) : (
            <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-green-200">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              All caught up
            </span>
          )}

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-primary hover:bg-primary-fixed px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#c3c6d1]"
            >
              <span className="material-symbols-outlined text-xs">done_all</span>
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setSelectedFilter("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
            selectedFilter === "All"
              ? "bg-[#001e40] text-white"
              : "bg-white text-gray-650 border border-[#c3c6d1] hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedFilter("Unread")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
            selectedFilter === "Unread"
              ? "bg-[#001e40] text-white"
              : "bg-white text-gray-650 border border-[#c3c6d1] hover:bg-gray-50"
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setSelectedFilter("New Assignments")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
            selectedFilter === "New Assignments"
              ? "bg-[#001e40] text-white"
              : "bg-white text-gray-650 border border-[#c3c6d1] hover:bg-gray-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          New Assignments
        </button>
        <button
          onClick={() => setSelectedFilter("SLA Warnings")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
            selectedFilter === "SLA Warnings"
              ? "bg-[#001e40] text-white"
              : "bg-white text-gray-650 border border-[#c3c6d1] hover:bg-gray-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-650" />
          SLA Warnings
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-[#c3c6d1]">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-[#001e40] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading notifications...</span>
            </div>
          </div>
        ) : filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl p-5 shadow-sm border transition-shadow relative overflow-hidden group ${
                n.borderClass
              } ${n.isUnread ? "" : "opacity-75 hover:opacity-100 border-[#c3c6d1]"}`}
            >
              {n.isUnread && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#001e40] opacity-5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              )}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-start w-full">
                  <div
                    className={`${n.bgClass} p-2 rounded-full shrink-0 flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-[20px] font-bold">
                      {n.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          n.type.includes("Assignment")
                            ? "text-[#fe9832]"
                            : n.type.includes("SLA") || n.type.includes("Overdue")
                            ? "text-red-600"
                            : "text-[#001e40]"
                        }`}
                      >
                        {n.type}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">
                          schedule
                        </span>
                        {n.time}
                      </span>
                      {n.isUnread && (
                        <span className="bg-[#d5e3ff] text-[#001e40] text-[9px] px-1.5 py-0.5 rounded font-bold ml-1 hidden sm:block">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 leading-normal">
                      {n.text}
                    </p>

                    {/* Rich Embedded elements (e.g. image preview or quote) */}
                    {n.hasImage && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-3">
                        <img
                          alt="Attached evidence"
                          className="w-16 h-16 object-cover rounded-md border border-[#c3c6d1] shadow-sm shrink-0"
                          src={n.imageSrc}
                        />
                        <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-xs text-gray-500 italic flex-1 leading-relaxed">
                          {n.quote}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-150">
                  <button
                    onClick={() => onNavigateToComplaint(n.ticketId)}
                    className="flex-grow sm:flex-none bg-gray-50 hover:bg-[#d5e3ff] hover:text-[#001e40] text-[#001e40] border border-[#c3c6d1] px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    {n.type.includes("Citizen") ? "View Thread" : "View Grievance"}
                  </button>
                  {n.isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 rounded-lg border border-gray-300 text-gray-400 hover:text-primary hover:bg-[#d5e3ff]/50 transition-colors"
                      title="Mark as Read"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        done
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">
            No notifications matching this filter category.
          </div>
        )}
      </div>

      {/* Load More button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => console.log("Load older notifications clicked")}
          className="text-[#001e40] hover:bg-gray-150 px-5 py-2.5 rounded-full text-xs font-bold transition-colors border border-gray-400 flex items-center gap-1"
        >
          <span className="material-symbols-outlined">expand_more</span>
          Load Older Notifications
        </button>
      </div>
    </div>
  );
}
