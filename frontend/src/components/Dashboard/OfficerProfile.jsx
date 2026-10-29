import React, { useRef, useState, useEffect } from "react";
import { api } from "../../utils/api";

export default function OfficerProfile({ onBackToDashboard }) {
  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile picture
  const [avatarSrc, setAvatarSrc] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBkGdOyp1uVvJSa9NaQsNafaVHCgrRH29iXXD10u9aFzX0HYFgepul5-Mm4v_LwJO7_lf8rmJL_XY-qHNpKq71AbFY_NANVSz1i7Wq1LJtEpPt4WB5Jpyev-jrqwzHJt5wMr2smk8cVQm-Xa7i7wYlPzMWgo1fvAUWYGopjSDlFoGK2dGJe-BHC21ejn78EvJXvd6HkFhr4yucm-YvZrFXGFwFHmQJsNLBZgtWjn64bxje8BTGhM7A1w"
  );
  const fileInputRef = useRef(null);

  // Officer Raw Data
  const [officerData, setOfficerData] = useState(null);

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Ramesh Kumar Sharma",
    designation: "District Officer - Grade I",
    joiningDate: "15th September 2021",
    district: "Salem, Tamil Nadu",
  });
  const [tempPersonal, setTempPersonal] = useState({ ...personalInfo });

  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    email: "ramesh.kumar@gov.in",
    phone: "+91 98765 43210",
    extension: "443",
    address: "District Collectorate Office,\nRoom No. 302, 3rd Floor,\nSalem - 636001, Tamil Nadu",
  });
  const [tempContact, setTempContact] = useState({ ...contactInfo });

  const loadOfficerProfile = async () => {
    setLoading(true);
    try {
      const res = await api.officer.getProfile();
      if (res.success && res.data) {
        const off = res.data;
        setOfficerData(off);
        const pInfo = {
          fullName: off.full_name || "Nodal Officer",
          designation: off.designation || "Executive Engineer",
          joiningDate: off.created_at
            ? new Date(off.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "15th September 2021",
          district: `${off.district?.district_name || "Salem"}, Tamil Nadu`,
        };
        setPersonalInfo(pInfo);
        setTempPersonal(pInfo);

        const cInfo = {
          email: off.email || "officer@gov.in",
          phone: off.phone || "+91 98765 43210",
          extension: "443",
          address: `District Collectorate Office,\n${off.district?.district_name || "Salem"} Jurisdiction,\nTamil Nadu`,
        };
        setContactInfo(cInfo);
        setTempContact(cInfo);
      }
    } catch (err) {
      console.error("Failed to load officer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficerProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarSrc(URL.createObjectURL(file));
    }
  };

  const handlePersonalEditToggle = async () => {
    if (isEditingPersonal) {
      // Save personal info to backend API
      try {
        const res = await api.officer.updateProfile({
          fullName: tempPersonal.fullName,
          designation: tempPersonal.designation,
        });
        if (res.success) {
          setPersonalInfo({ ...tempPersonal });
        }
      } catch (err) {
        alert(err.message || "Failed to save profile changes.");
      }
    } else {
      setTempPersonal({ ...personalInfo });
    }
    setIsEditingPersonal(!isEditingPersonal);
  };

  const handlePersonalCancel = () => {
    setIsEditingPersonal(false);
  };

  const handleContactEditToggle = async () => {
    if (isEditingContact) {
      // Save contact info to backend API
      try {
        const res = await api.officer.updateProfile({
          phone: tempContact.phone,
        });
        if (res.success) {
          setContactInfo({ ...tempContact });
        }
      } catch (err) {
        alert(err.message || "Failed to save contact changes.");
      }
    } else {
      setTempContact({ ...contactInfo });
    }
    setIsEditingContact(!isEditingContact);
  };

  const handleContactCancel = () => {
    setIsEditingContact(false);
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#c3c6d1]/40 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Officer Profile</h2>
          <p className="text-sm text-gray-500 mt-1 font-semibold">
            Manage your personal credentials, assigned region, and official details.
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-150 transition-colors font-bold text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 font-semibold flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-[#001e40] border-t-transparent rounded-full animate-spin" />
          Loading officer profile from backend...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Card & Access info */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm flex flex-col items-center text-center">
              {/* Circular Avatar */}
              <div className="relative mb-6">
                <img
                  alt="Officer Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                  src={avatarSrc}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#001e40] text-white p-2 rounded-full shadow-md hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>

              <h3 className="text-lg font-bold text-[#001e40] mb-1">
                {personalInfo.fullName}
              </h3>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                {personalInfo.designation}
              </p>

              <div className="mt-6 w-full border-t border-gray-150 pt-6 flex flex-col gap-3 text-xs font-semibold text-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-450">Employee ID</span>
                  <span className="text-gray-800 font-bold font-mono">
                    {officerData?.employee_id || "SAL-HW-0921"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-450">Department</span>
                  <span className="text-gray-800 font-bold">
                    {officerData?.department?.department_name || "Roads & Highways"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-450">Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    {officerData?.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Access Card */}
            <div className="bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#001e40] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">security</span>
                Security &amp; Access Scope
              </h4>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                    badge
                  </span>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Role</p>
                    <p className="text-gray-850 mt-0.5">District Officer (Level 2)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                    location_on
                  </span>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Jurisdiction</p>
                    <p className="text-gray-850 mt-0.5">{officerData?.district?.district_name || "Salem"} District</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Workload summary & Details cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Workload Summary Bento from Database */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] border-l-4 border-l-green-600 flex flex-col justify-between shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Total Resolved
                </p>
                <p className="text-3xl font-bold text-green-700">
                  {officerData?.metrics?.totalResolved ?? 12}
                </p>
                <p className="text-[10px] text-green-700 font-bold mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    check_circle
                  </span>{" "}
                  Verified &amp; Closed
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] border-l-4 border-l-[#fe9832] flex flex-col justify-between shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Active Complaints
                </p>
                <p className="text-3xl font-bold text-[#fe9832]">
                  {officerData?.metrics?.activeComplaints ?? 3}
                </p>
                <p className="text-[10px] text-gray-450 mt-3 font-semibold">
                  Requires attention
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] border-l-4 border-l-[#001e40] flex flex-col justify-between shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Avg. Resolution
                </p>
                <p className="text-3xl font-bold text-[#001e40]">
                  3.5<span className="text-xs font-semibold ml-1 text-gray-500">Days</span>
                </p>
                <p className="text-[10px] text-[#001e40] font-bold mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">speed</span>{" "}
                  Within Citizen Charter SLA
                </p>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-150 pb-4 mb-4">
                <h4 className="text-base font-bold text-[#001e40]">Personal Information</h4>
                <div className="flex gap-2">
                  {isEditingPersonal ? (
                    <>
                      <button
                        onClick={handlePersonalCancel}
                        className="text-xs font-semibold text-gray-500 px-3 py-1 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePersonalEditToggle}
                        className="bg-[#001e40] text-white text-xs font-bold px-3 py-1 rounded"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handlePersonalEditToggle}
                      className="text-[#001e40] hover:bg-gray-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-[#c3c6d1]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit_note
                      </span>{" "}
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Full Name
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={tempPersonal.fullName}
                      onChange={(e) =>
                        setTempPersonal({ ...tempPersonal, fullName: e.target.value })
                      }
                      className="w-full px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{personalInfo.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Designation
                  </label>
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={tempPersonal.designation}
                      onChange={(e) =>
                        setTempPersonal({ ...tempPersonal, designation: e.target.value })
                      }
                      className="w-full px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="font-semibold text-gray-850">{personalInfo.designation}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-450 block mb-1">
                    Date of Joining
                  </label>
                  <p className="font-semibold text-gray-855">{personalInfo.joiningDate}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-455 block mb-1">
                    Primary District
                  </label>
                  <div className="flex items-center gap-1 text-gray-800 font-semibold">
                    <span className="material-symbols-outlined text-gray-450 text-[18px]">
                      location_on
                    </span>
                    <p>{personalInfo.district}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-150 pb-4 mb-4">
                <h4 className="text-base font-bold text-[#001e40]">Contact Details</h4>
                <div className="flex gap-2">
                  {isEditingContact ? (
                    <>
                      <button
                        onClick={handleContactCancel}
                        className="text-xs font-semibold text-gray-500 px-3 py-1 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleContactEditToggle}
                        className="bg-[#001e40] text-white text-xs font-bold px-3 py-1 rounded"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleContactEditToggle}
                      className="text-[#001e40] hover:bg-gray-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-[#c3c6d1]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit_note
                      </span>{" "}
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-sm font-semibold">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-gray-50 border border-gray-250 rounded-full text-[#001e40] mt-1 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <div className="flex-grow">
                    <label className="text-xs font-bold text-gray-450 block">Official Email</label>
                    <a
                      className="text-[#001e40] hover:underline text-sm font-bold mt-0.5 block"
                      href={`mailto:${contactInfo.email}`}
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-gray-50 border border-gray-255 rounded-full text-[#001e40] mt-1 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                  </div>
                  <div className="flex-grow">
                    <label className="text-xs font-bold text-gray-450 block">Phone Number</label>
                    {isEditingContact ? (
                      <input
                        type="text"
                        value={tempContact.phone}
                        onChange={(e) =>
                          setTempContact({ ...tempContact, phone: e.target.value })
                        }
                        className="w-full max-w-xs px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none font-semibold text-gray-800 mt-1"
                      />
                    ) : (
                      <div className="mt-0.5">
                        <p className="text-gray-800">{contactInfo.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-gray-50 border border-gray-255 rounded-full text-[#001e40] mt-1 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">business</span>
                  </div>
                  <div className="flex-grow">
                    <label className="text-xs font-bold text-gray-450 block">Office Address</label>
                    <p className="text-gray-850 mt-1 whitespace-pre-line leading-relaxed">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
