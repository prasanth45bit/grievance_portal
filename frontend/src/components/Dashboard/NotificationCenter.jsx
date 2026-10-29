import React, { useRef, useState, useEffect } from "react";
import { api } from "../../utils/api";

export default function NotificationCenter({ onBackToDashboard, onNavigate }) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const filterChips = [
    "All",
    "Status Update",
    "Action Required",
    "General Announcement",
  ];

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.getNotifications();
      if (res.success && res.data && res.data.length > 0) {
        const mapped = res.data.map((n) => ({
          id: n.notification_id,
          category: n.title?.includes("Accepted") || n.title?.includes("Resolved") ? "Status Update" : "Action Required",
          time: new Date(n.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
          title: n.title,
          description: n.message,
          isActionable: !n.is_read,
          color: n.title?.includes("Resolved") ? "bg-green-600" : "bg-[#001e40]",
          bgContainer: n.title?.includes("Resolved") ? "bg-green-100 text-green-700" : "bg-[#d5e3ff] text-[#001e40]",
          icon: n.title?.includes("Resolved") ? "check_circle" : "notifications",
          raw: n,
        }));
        setNotifications(mapped);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn("Could not load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifs = notifications.filter((notif) => {
    if (selectedFilter === "All") return true;
    return notif.category === selectedFilter;
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      alert("Please choose a file to upload.");
      return;
    }
    setIsDocumentUploaded(true);
    setShowUploadModal(false);
  };

  return (
    <div className="bg-[#f4f3f8] text-[#1a1c1f] mx-auto rounded-2xl shadow-md border border-[#c3c6d1] overflow-hidden">
      {/* Header Area */}
      <header className="bg-white border-b border-[#c3c6d1] sticky top-0 z-10">
        <div className="flex items-center px-4 h-16 gap-4">
          <button
            onClick={onBackToDashboard}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-[#001e40] flex-1">
            Notification Center
          </h1>
        </div>

        {/* Filter Chips Horizontal scroll */}
        <div className="px-4 pb-4 pt-2 overflow-x-auto no-scrollbar flex gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setSelectedFilter(chip)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedFilter === chip
                  ? "bg-[#003366] text-white border-[#003366]"
                  : "bg-white text-gray-600 border-[#c3c6d1] hover:bg-gray-50"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </header>

      {/* Main List */}
      <main className="p-4 space-y-4 min-h-[500px]">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => {
            // Special treatment if documents uploaded for notif-1
            if (notif.id === "notif-1" && isDocumentUploaded) {
              return (
                <div
                  key={notif.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#c3c6d1] flex flex-col gap-3 relative overflow-hidden animate-fade-in"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-600" />
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                          Received
                        </span>
                        <span className="text-xs text-gray-500">Just now</span>
                      </div>
                      <h2 className="text-base font-bold text-gray-900 mb-1">
                        Tax Receipt Uploaded
                      </h2>
                      <p className="text-xs text-gray-600">
                        File <strong>{uploadedFile?.name}</strong> received successfully.
                        Nodal officer has been notified.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={notif.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-[#c3c6d1] flex flex-col gap-3 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${notif.color}`} />
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.bgContainer}`}
                  >
                    <span className="material-symbols-outlined">{notif.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          notif.category === "Action Required"
                            ? "text-red-600"
                            : notif.category === "Status Update"
                            ? "text-[#1f477b]"
                            : "text-gray-500"
                        }`}
                      >
                        {notif.category}
                      </span>
                      <span className="text-xs text-gray-500">{notif.time}</span>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mb-1 truncate">
                      {notif.title}
                    </h2>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {/* Conditional Actions inside notifications */}
                {notif.isActionable && (
                  <div className="flex items-center gap-3 mt-2 pl-12">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-[#001e40] text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    >
                      Upload Now
                    </button>
                    <button className="bg-transparent border border-gray-400 text-gray-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
                      Later
                    </button>
                  </div>
                )}

                {notif.isResolvedLink && (
                  <div className="flex items-center gap-3 mt-1 pl-12">
                    <button
                      onClick={() =>
                        setSelectedDetail({
                          id: "#CP2024/9845",
                          subject: "Street Light Outage in Sector 7",
                          status: "Resolved",
                          detail:
                            "Regional municipal corporation has repaired the wiring harness and successfully restored street illumination.",
                        })
                      }
                      className="text-primary text-xs font-bold hover:underline flex items-center gap-0.5 py-1"
                    >
                      View Details
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                )}

                {notif.isTrackLink && (
                  <div className="flex items-center gap-3 mt-1 pl-12">
                    <button
                      onClick={() => onNavigate("track")}
                      className="text-primary text-xs font-bold hover:underline flex items-center gap-0.5 py-1"
                    >
                      Track Status
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            No notifications found under this filter category.
          </div>
        )}

        {/* End of list */}
        <div className="text-center py-6 text-gray-400 text-xs font-medium opacity-65">
          End of notifications
        </div>
      </main>

      {/* Upload Property Tax Receipt Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in text-[#1a1c1f]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#001e40]">
                  upload_file
                </span>
                Upload Property Tax Receipt
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Please choose the supporting property tax receipt for grievance{" "}
                <strong>#CP2024/9912</strong>. Upload file sizes must not exceed 10MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#c3c6d1] rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                  cloud_upload
                </span>
                {uploadedFile ? (
                  <span className="text-xs font-bold text-[#001e40]">
                    {uploadedFile.name}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-bold">
                    Click to select property tax receipt file
                  </span>
                )}
                <span className="text-[10px] text-gray-400 mt-1">
                  PDF, PNG or JPG (max. 10MB)
                </span>
              </button>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001e40] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-colors"
                >
                  Submit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Details Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in text-[#1a1c1f]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Grievance ID</p>
                <h3 className="text-lg font-bold text-primary">{selectedDetail.id}</h3>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-bold">Subject</p>
                <p className="font-semibold text-sm mt-0.5">{selectedDetail.subject}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-bold">Status</p>
                <span className="inline-flex mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  {selectedDetail.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-bold">Resolution Details</p>
                <p className="text-xs text-gray-600 leading-relaxed mt-1">
                  {selectedDetail.detail}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-95"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
