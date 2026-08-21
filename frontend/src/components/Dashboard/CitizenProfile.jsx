import React from "react";

export default function CitizenProfile({ onBackToDashboard }) {
  return (
    <div className="bg-gray-50 text-[#1a1c1f]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Citizen Profile</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your personal information and contact details.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-400 text-gray-600 rounded-full hover:bg-gray-100 transition-all font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Dashboard
          </button>
          <button className="flex items-center gap-2 bg-[#001e40] text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all ambient-shadow text-sm font-semibold group">
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
              edit
            </span>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-xl p-6 ambient-shadow border border-[#c3c6d1]">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
              <span className="material-symbols-outlined text-[#001e40] bg-[#d5e3ff] p-2 rounded-lg">
                badge
              </span>
              <h3 className="text-xl font-bold text-on-surface">
                Personal Details
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Avatar Section */}
              <div className="relative group">
                <img
                  alt="Ravi Kumar"
                  className="w-32 h-32 rounded-xl object-cover ambient-shadow border-4 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT-OUf2IgLbcOVWAQ4-nwryDh4sKDQuwiUX8Sf7X8d0PgUPRiKZcB8RNzIxaTPvfHldsgnsjJjRLNVX87T7uFY9NnTaCSpFKt3kkrOV3bRTFRx0vF_K_V-dibz-9YkRskVKg7b5MJawYwAT5wyfdwTKLI7SRG4SUNiXIOs7eb_66I064psB20L5wQoYbuTkv1nMjtZ9WyYeQ9vhkU4lXOqj6JV5m5eeftI0ZdyvZ6x4RTj92LUbNE47w"
                />
                <button className="absolute bottom-[-10px] right-[-10px] bg-[#001e40] text-white p-2 rounded-full shadow-md hover:opacity-90 transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200">
                  <span className="material-symbols-outlined text-[18px]">
                    photo_camera
                  </span>
                </button>
              </div>

              {/* Details Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    Full Name
                  </label>
                  <p className="text-lg font-bold text-[#001e40]">
                    Ravi Kumar
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    Aadhaar Number
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-[#001e40] font-mono tracking-wider">
                      XXXX XXXX 4921
                    </p>
                    <span className="material-symbols-outlined text-green-700 bg-green-100 rounded-full text-[16px] p-0.5">
                      verified
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    Date of Birth
                  </label>
                  <p className="text-base text-gray-800">15 Oct 1985</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">
                    Gender
                  </label>
                  <p className="text-base text-gray-800">Male</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details Card */}
          <div className="bg-white rounded-xl p-6 ambient-shadow border border-[#c3c6d1]">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#001e40] bg-[#d5e3ff] p-2 rounded-lg">
                  location_city
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  Location Details
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Residential Address
                </label>
                <p className="text-base text-gray-800">
                  Flat 402, Sunshine Apartments, Sector 14, MG Road Area.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  State/UT
                </label>
                <p className="text-base text-gray-800">Maharashtra</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  District
                </label>
                <p className="text-base text-gray-800">Pune</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Pincode
                </label>
                <p className="text-base text-gray-800 font-semibold">411014</p>
              </div>
            </div>

            {/* Map Context Placeholder */}
            <div className="mt-6 h-32 rounded-lg bg-gray-100 overflow-hidden relative border border-[#c3c6d1]">
              <img
                alt="Location Map"
                className="w-full h-full object-cover opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF9dnijUtShE3UDG6ljV2mVrFJzTY2PTlIrFhfFeQ5SabxMI0yD3GArF8p0F1FZdyVnnyUAMETaefG4SeADZ6N4yAhx4sOloqHIGfg_2ES_3aNMHpKSbOpiDf9yz6pUuW8FZ1kZANamY6axWALs8leQ27Z1QXNfxe1Zg6eKzOxk2Sg7p269DnAYWNOEpGtJHTTyiRO10c4wR3gxCtDJ2qQ8p4o2Gdw0yB889W6fPaRdhhjWLsbj81lyA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl p-6 ambient-shadow border border-[#c3c6d1]">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
              <span className="material-symbols-outlined text-[#001e40] bg-[#d5e3ff] p-2 rounded-lg">
                contact_mail
              </span>
              <h3 className="text-xl font-bold text-on-surface">
                Contact Details
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Email Address
                </label>
                <div className="flex items-center justify-between group">
                  <p className="text-sm text-gray-800 break-all">
                    ravi.kumar.citizen@example.com
                  </p>
                  <button
                    aria-label="Copy Email"
                    className="text-[#001e40] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    onClick={() => navigator.clipboard.writeText("ravi.kumar.citizen@example.com")}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      content_copy
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center justify-between">
                  <p className="text-base text-gray-800 font-semibold">
                    +91 98765 43210
                  </p>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    Verified
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Alternate Contact (Optional)
                </label>
                <p className="text-sm text-gray-500 italic">Not provided</p>
              </div>
            </div>
          </div>

          {/* Security / Account Status */}
          <div className="bg-gradient-to-br from-[#003366] to-[#001e40] text-white rounded-xl p-6 ambient-shadow">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8dfc75] text-[28px]">
                shield_person
              </span>
              <div>
                <h4 className="text-lg font-bold mb-1">Account Security</h4>
                <p className="text-xs text-blue-200 mb-4 leading-relaxed">
                  Your account is secured with 2-Factor Authentication.
                </p>
                <button className="text-xs font-bold bg-white text-[#001e40] px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors w-full text-center">
                  Manage Security
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
