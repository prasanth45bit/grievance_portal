import React, { useState } from "react";

export default function OfficerSettings({ onBackToDashboard }) {
  // Duty status state
  const [isDutyActive, setIsDutyActive] = useState(true);

  // Security passwords
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [securityToast, setSecurityToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Contact Info
  const [email, setEmail] = useState("officer.sharma@gov.in");
  const [contactToast, setContactToast] = useState(false);

  // Localization
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("ist");
  const [dateFormat, setDateFormat] = useState("ddmmyyyy");

  // Alert preferences
  const [alertNew, setAlertNew] = useState(true);
  const [alertVip, setAlertVip] = useState(true);
  const [alertOverdue, setAlertOverdue] = useState(true);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      setSecurityToast({
        type: "error",
        message: "Please fill in all security fields.",
      });
      return;
    }
    if (newPwd !== confirmPwd) {
      setSecurityToast({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }
    if (newPwd.length < 6) {
      setSecurityToast({
        type: "error",
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    setSecurityToast({
      type: "success",
      message: "Password updated successfully!",
    });
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setTimeout(() => {
      setSecurityToast(null);
    }, 4000);
  };

  const handleContactSave = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Please enter a valid official email address.");
      return;
    }
    setContactToast(true);
    setTimeout(() => {
      setContactToast(false);
    }, 3500);
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#c3c6d1]/40 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-[#001e40]">Account Settings</h2>
          <p className="text-sm text-gray-500 mt-1 font-semibold">
            Manage your officer profile, preferences, and system access.
          </p>
        </div>

        {/* Availability Status Toggle (Prominent) */}
        <div className="bg-gray-100 border border-[#c3c6d1] rounded-xl p-3 flex items-center gap-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#001e40]">Duty Status</span>
            <span
              className={`text-xs font-bold ${
                isDutyActive ? "text-gray-500" : "text-orange-600"
              }`}
            >
              {isDutyActive
                ? "Active (Receiving Assignments)"
                : "On Leave (Assignments Paused)"}
            </span>
          </div>

          {/* Toggle Switch */}
          <div className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              id="duty-toggle"
              className="sr-only"
              checked={isDutyActive}
              onChange={() => setIsDutyActive(!isDutyActive)}
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                isDutyActive ? "bg-[#001e40]" : "bg-gray-300"
              }`}
            />
            <div
              className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                isDutyActive ? "translate-x-5" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Security & Contact Information */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Security Card */}
          <section className="bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-[#fe9832]" />
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-150">
              <span className="material-symbols-outlined text-primary text-[24px]">
                lock
              </span>
              <h3 className="text-base font-bold text-primary">
                Security &amp; Authentication
              </h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
              {securityToast && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    securityToast.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {securityToast.message}
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-bold text-gray-700 mb-1"
                  htmlFor="current-pwd"
                >
                  Current Password
                </label>
                <input
                  id="current-pwd"
                  type="password"
                  placeholder="••••••••"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold text-gray-700 mb-1"
                    htmlFor="new-pwd"
                  >
                    New Password
                  </label>
                  <input
                    id="new-pwd"
                    type="password"
                    placeholder="••••••••"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold text-gray-700 mb-1"
                    htmlFor="confirm-pwd"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-pwd"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#001e40] hover:opacity-90 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </section>

          {/* Contact Information Card */}
          <section className="bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-150">
              <span className="material-symbols-outlined text-primary text-[24px]">
                contact_mail
              </span>
              <h3 className="text-base font-bold text-primary">
                Contact Information
              </h3>
            </div>

            <form onSubmit={handleContactSave} className="space-y-4 max-w-lg">
              {contactToast && (
                <div className="p-3 bg-green-50 border border-green-205 text-green-800 rounded-lg text-xs font-semibold">
                  Official email verify link sent to {email}.
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-bold text-gray-700 mb-1"
                  htmlFor="official-email"
                >
                  Official Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-gray-400 text-[20px]">
                    mail
                  </span>
                  <input
                    id="official-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-gray-800"
                  />
                </div>
                <p className="text-[10px] text-gray-450 mt-1 font-semibold">
                  This email is used for official CPGRAMS communications and dispatch reports.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="border border-[#001e40] text-[#001e40] hover:bg-gray-100 font-bold text-xs py-2 px-4 rounded-lg transition-colors"
                >
                  Verify &amp; Save
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Column 2: Localization & Preferences */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Localization Card */}
          <section className="bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-150">
              <span className="material-symbols-outlined text-primary text-[24px]">
                public
              </span>
              <h3 className="text-base font-bold text-primary">Localization</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold text-gray-700 mb-1"
                  htmlFor="portal-language"
                >
                  Portal Language
                </label>
                <select
                  id="portal-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-sm focus:outline-none text-gray-800 font-semibold cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-bold text-gray-700 mb-1"
                    htmlFor="timezone"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-xs focus:outline-none text-gray-850 font-semibold cursor-pointer"
                  >
                    <option value="ist">(IST) Asia/Kolkata</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-bold text-gray-700 mb-1"
                    htmlFor="date-format"
                  >
                    Date Format
                  </label>
                  <select
                    id="date-format"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-[#c3c6d1] rounded-lg text-xs focus:outline-none text-gray-850 font-semibold cursor-pointer"
                  >
                    <option value="ddmmyyyy">DD/MM/YYYY</option>
                    <option value="mmddyyyy">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Card */}
          <section className="bg-white border border-[#c3c6d1] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-150">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  notifications_active
                </span>
                <h3 className="text-base font-bold text-primary">
                  Alert Preferences
                </h3>
              </div>

              <div className="space-y-4">
                {/* Type 1: New Assignments */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-[#c3c6d1] rounded-lg">
                  <div className="flex flex-col mr-2">
                    <span className="text-xs font-bold text-[#001e40]">
                      New Assignments
                    </span>
                    <span className="text-[10px] text-gray-500 leading-normal mt-0.5">
                      Notify when a new highways grievance is routed to you.
                    </span>
                    <div className="flex gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 bg-gray-200 text-gray-650 rounded-full">
                        <span className="material-symbols-outlined text-[10px]">
                          mail
                        </span>{" "}
                        Email
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        <span className="material-symbols-outlined text-[10px]">
                          desktop_windows
                        </span>{" "}
                        Dashboard
                      </span>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      id="alert-new"
                      className="sr-only"
                      checked={alertNew}
                      onChange={() => setAlertNew(!alertNew)}
                    />
                    <div
                      className={`w-9 h-5 rounded-full transition-colors ${
                        alertNew ? "bg-[#001e40]" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                        alertNew ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Type 2: High Priority */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-l-4 border-l-[#fe9832] border border-[#c3c6d1] rounded-lg">
                  <div className="flex flex-col mr-2">
                    <span className="text-xs font-bold text-[#001e40]">
                      High Priority &amp; VIP
                    </span>
                    <span className="text-[10px] text-gray-500 leading-normal mt-0.5">
                      Immediate alerts for sensitive highway cases.
                    </span>
                    <div className="flex gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        <span className="material-symbols-outlined text-[10px]">
                          mail
                        </span>{" "}
                        Email
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        <span className="material-symbols-outlined text-[10px]">
                          sms
                        </span>{" "}
                        SMS
                      </span>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      id="alert-vip"
                      className="sr-only"
                      checked={alertVip}
                      onChange={() => setAlertVip(!alertVip)}
                    />
                    <div
                      className={`w-9 h-5 rounded-full transition-colors ${
                        alertVip ? "bg-[#fe9832]" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                        alertVip ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Type 3: Overdue warnings */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-l-4 border-l-red-600 border border-[#c3c6d1] rounded-lg">
                  <div className="flex flex-col mr-2">
                    <span className="text-xs font-bold text-[#001e40]">
                      Overdue Warnings
                    </span>
                    <span className="text-[10px] text-gray-500 leading-normal mt-0.5">
                      Alerts 24 hours before SLA breach.
                    </span>
                    <div className="flex gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        <span className="material-symbols-outlined text-[10px]">
                          mail
                        </span>{" "}
                        Email
                      </span>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      id="alert-overdue"
                      className="sr-only"
                      checked={alertOverdue}
                      onChange={() => setAlertOverdue(!alertOverdue)}
                    />
                    <div
                      className={`w-9 h-5 rounded-full transition-colors ${
                        alertOverdue ? "bg-[#001e40]" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                        alertOverdue ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Back action */}
            <div className="mt-6 pt-4 border-t border-gray-150 flex justify-end">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-xs font-bold border border-gray-400 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
