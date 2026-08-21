import React, { useRef, useState } from "react";

export default function OfficerProfile({ onBackToDashboard }) {
  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Profile picture
  const [avatarSrc, setAvatarSrc] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBkGdOyp1uVvJSa9NaQsNafaVHCgrRH29iXXD10u9aFzX0HYFgepul5-Mm4v_LwJO7_lf8rmJL_XY-qHNpKq71AbFY_NANVSz1i7Wq1LJtEpPt4WB5Jpyev-jrqwzHJt5wMr2smk8cVQm-Xa7i7wYlPzMWgo1fvAUWYGopjSDlFoGK2dGJe-BHC21ejn78EvJXvd6HkFhr4yucm-YvZrFXGFwFHmQJsNLBZgtWjn64bxje8BTGhM7A1w"
  );
  const fileInputRef = useRef(null);

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Ramesh Kumar Sharma",
    designation: "District Officer - Grade I",
    joiningDate: "15th September 2018",
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

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarSrc(URL.createObjectURL(file));
    }
  };

  const handlePersonalEditToggle = () => {
    if (isEditingPersonal) {
      // Save personal info
      setPersonalInfo({ ...tempPersonal });
    } else {
      // Enter edit mode
      setTempPersonal({ ...personalInfo });
    }
    setIsEditingPersonal(!isEditingPersonal);
  };

  const handlePersonalCancel = () => {
    setIsEditingPersonal(false);
  };

  const handleContactEditToggle = () => {
    if (isEditingContact) {
      // Save contact info
      setContactInfo({ ...tempContact });
    } else {
      // Enter edit mode
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
            Manage your personal information and official details.
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
                <span className="text-gray-800 font-bold">SAL-HW-0921</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-450">Department</span>
                <span className="text-gray-800 font-bold font-mono">Highways</span>
              </div>
            </div>
          </div>

          {/* Security & Access Card */}
          <div className="bg-white rounded-xl border border-[#c3c6d1] p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#001e40] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">security</span>
              Security &amp; Access
            </h4>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                  badge
                </span>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Current Role</p>
                  <p className="text-gray-850 mt-0.5">District Officer (Level 2)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-450 mt-0.5 text-[18px]">
                  history
                </span>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Last Login</p>
                  <p className="text-gray-850 mt-0.5">Oct 24, 2023 - 09:15 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workload summary & Details cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Workload Summary Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] border-l-4 border-l-green-600 flex flex-col justify-between shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Total Resolved
              </p>
              <p className="text-3xl font-bold text-green-700">1,432</p>
              <p className="text-[10px] text-green-700 font-bold mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  trending_up
                </span>{" "}
                +12% this month
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] border-l-4 border-l-[#fe9832] flex flex-col justify-between shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Active Complaints
              </p>
              <p className="text-3xl font-bold text-[#fe9832]">84</p>
              <p className="text-[10px] text-gray-450 mt-3 font-semibold">
                Requires attention
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#c3c6d1] border-l-4 border-l-[#001e40] flex flex-col justify-between shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Avg. Resolution
              </p>
              <p className="text-3xl font-bold text-[#001e40]">
                4.2<span className="text-xs font-semibold ml-1 text-gray-500">Days</span>
              </p>
              <p className="text-[10px] text-[#001e40] font-bold mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">speed</span>{" "}
                Within SLA
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
                    className="text-primary hover:bg-gray-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-[#c3c6d1]"
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
                    className="w-full px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none"
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
                    className="w-full px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-gray-850">{personalInfo.designation}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-450 block mb-1">
                  Date of Joining
                </label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={tempPersonal.joiningDate}
                    onChange={(e) =>
                      setTempPersonal({ ...tempPersonal, joiningDate: e.target.value })
                    }
                    className="w-full px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none"
                  />
                ) : (
                  <p className="font-semibold text-gray-855">{personalInfo.joiningDate}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-455 block mb-1">
                  Primary District
                </label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={tempPersonal.district}
                    onChange={(e) =>
                      setTempPersonal({ ...tempPersonal, district: e.target.value })
                    }
                    className="w-full px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-1 text-gray-800 font-semibold">
                    <span className="material-symbols-outlined text-gray-450 text-[18px]">
                      location_on
                    </span>
                    <p>{personalInfo.district}</p>
                  </div>
                )}
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
                    className="text-primary hover:bg-gray-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-[#c3c6d1]"
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
                <div className="p-1.5 bg-gray-50 border border-gray-250 rounded-full text-primary mt-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div className="flex-grow">
                  <label className="text-xs font-bold text-gray-450 block">Official Email</label>
                  {isEditingContact ? (
                    <input
                      type="email"
                      value={tempContact.email}
                      onChange={(e) =>
                        setTempContact({ ...tempContact, email: e.target.value })
                      }
                      className="w-full max-w-sm px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none mt-1"
                    />
                  ) : (
                    <a
                      className="text-primary hover:underline text-sm font-bold mt-0.5 block"
                      href={`mailto:${contactInfo.email}`}
                    >
                      {contactInfo.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gray-50 border border-gray-255 rounded-full text-primary mt-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </div>
                <div className="flex-grow">
                  <label className="text-xs font-bold text-gray-450 block">Phone Number</label>
                  {isEditingContact ? (
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="text"
                        value={tempContact.phone}
                        onChange={(e) =>
                          setTempContact({ ...tempContact, phone: e.target.value })
                        }
                        className="w-full max-w-xs px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none"
                      />
                      <span className="text-xs text-gray-450">Ext:</span>
                      <input
                        type="text"
                        value={tempContact.extension}
                        onChange={(e) =>
                          setTempContact({ ...tempContact, extension: e.target.value })
                        }
                        className="w-16 px-2 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="mt-0.5">
                      <p className="text-gray-800">{contactInfo.phone}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Extension: {contactInfo.extension}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gray-50 border border-gray-255 rounded-full text-primary mt-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">business</span>
                </div>
                <div className="flex-grow">
                  <label className="text-xs font-bold text-gray-450 block">Office Address</label>
                  {isEditingContact ? (
                    <textarea
                      rows={3}
                      value={tempContact.address}
                      onChange={(e) =>
                        setTempContact({ ...tempContact, address: e.target.value })
                      }
                      className="w-full px-3 py-1 border border-[#c3c6d1] rounded-lg text-sm bg-gray-50 focus:outline-none mt-1"
                    />
                  ) : (
                    <p className="text-gray-850 mt-1 whitespace-pre-line leading-relaxed">
                      {contactInfo.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
