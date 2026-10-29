import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";

export default function CitizenProfile({ onBackToDashboard }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    address: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.citizen.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setEditForm({
          fullName: res.data.full_name || "",
          address: res.data.address || "",
          pincode: res.data.pincode || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch citizen profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.citizen.updateProfile(editForm);
      if (res.success) {
        setProfile(res.data);
        setIsEditing(false);
        setToastMessage("Profile updated successfully!");
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      alert(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 text-[#1a1c1f]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Citizen Profile</h2>
          <p className="text-sm text-gray-600 mt-1 font-semibold">
            Manage your personal verification and registered contact details.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-150 transition-all font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-[#001e40] text-white px-5 py-2 rounded-lg hover:opacity-90 transition-all font-bold text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-400 rounded-lg font-bold text-xs text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-5 py-2 bg-[#001e40] text-white rounded-lg font-bold text-xs shadow-sm hover:opacity-90 flex items-center gap-1"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-semibold">
          <span className="material-symbols-outlined text-green-700">check_circle</span>
          {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500 font-semibold flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-[#001e40] border-t-transparent rounded-full animate-spin" />
          Loading official profile from backend...
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d1]">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-150">
                <span className="material-symbols-outlined text-[#001e40] bg-[#d5e3ff] p-2 rounded-lg text-[22px]">
                  badge
                </span>
                <h3 className="text-base font-bold text-[#001e40]">
                  Personal &amp; Identity Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#001e40] font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-base font-bold text-[#001e40]">
                      {profile.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Account Status
                  </label>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    <span className="w-2 h-2 rounded-full bg-green-600" />
                    {profile.status || "ACTIVE"}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Citizen ID
                  </label>
                  <p className="text-sm font-bold text-gray-800 font-mono">
                    CIT-TN-{profile.citizen_id?.toString().padStart(6, "0")}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Registration Date
                  </label>
                  <p className="text-sm font-semibold text-gray-700">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Verified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Details Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d1]">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-150">
                <span className="material-symbols-outlined text-[#001e40] bg-[#d5e3ff] p-2 rounded-lg text-[22px]">
                  location_city
                </span>
                <h3 className="text-base font-bold text-[#001e40]">
                  Location &amp; Address Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Residential Address
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-1.5 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#001e40] font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {profile.address || "Salem Collectorate Road, Salem District"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    State / Jurisdiction
                  </label>
                  <p className="text-sm font-semibold text-gray-800">Tamil Nadu</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                      className="w-full max-w-xs px-3 py-1.5 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#001e40] font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-sm font-bold text-gray-800 font-mono">
                      {profile.pincode || "636001"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d1]">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-150">
                <span className="material-symbols-outlined text-[#001e40] bg-[#d5e3ff] p-2 rounded-lg text-[22px]">
                  contact_mail
                </span>
                <h3 className="text-base font-bold text-[#001e40]">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">
                    Email Address
                  </label>
                  <p className="text-sm font-bold text-[#001e40]">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-450 uppercase block mb-1">
                    Mobile Number
                  </label>
                  <p className="text-sm font-bold text-gray-800">
                    {profile.phone}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-150">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    OTP &amp; Mobile Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
