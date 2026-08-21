import React, { useState } from "react";

export default function AccountSettings({ onBackToDashboard }) {
  // Accessibility
  const [fontSize, setFontSize] = useState("2");
  const [highContrast, setHighContrast] = useState(false);

  // Language
  const [primaryLang, setPrimaryLang] = useState("English");
  const [secondaryLang, setSecondaryLang] = useState("Hindi (हिन्दी)");

  // Security
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Notifications
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);

  // Save Settings Status
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPasswordFeedback({
        type: "error",
        message: "Please fill in all password fields.",
      });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPasswordFeedback({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }
    if (newPwd.length < 6) {
      setPasswordFeedback({
        type: "error",
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    // Success Mock
    setPasswordFeedback({
      type: "success",
      message: "Password updated successfully!",
    });
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setTimeout(() => {
      setPasswordFeedback(null);
    }, 4000);
  };

  const handleSaveSettings = () => {
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
    }, 3000);
  };

  const getFontSizeLabel = () => {
    if (fontSize === "1") return "Standard";
    if (fontSize === "2") return "Large";
    return "Extra Large";
  };

  return (
    <div className="bg-surface text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001e40]">Account Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your preferences, security, and accessibility options.
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

      {/* Settings Saved Notification Banner */}
      {saveFeedback && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-green-700">check_circle</span>
          All settings preferences have been saved successfully.
        </div>
      )}

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Accessibility Settings Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d1] flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
            <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center">
              <span className="material-symbols-outlined">accessibility</span>
            </div>
            <h2 className="text-lg font-bold text-on-surface">Accessibility</h2>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Font Size ({getFontSizeLabel()})
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 font-bold">A</span>
                <input
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#001e40]"
                  max="3"
                  min="1"
                  type="range"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                />
                <span className="text-lg text-gray-800 font-bold">A</span>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Standard</span>
                <span>Large</span>
                <span>Extra Large</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  High Contrast Mode
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Improves visibility for visually impaired users.
                </p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="contrast-toggle"
                  className="sr-only"
                  checked={highContrast}
                  onChange={() => setHighContrast(!highContrast)}
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    highContrast ? "bg-[#003366]" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    highContrast ? "translate-x-6" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Language Preferences Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d1] flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
            <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center">
              <span className="material-symbols-outlined">translate</span>
            </div>
            <h2 className="text-lg font-bold text-on-surface">
              Language Preferences
            </h2>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label
                className="block text-sm font-bold text-gray-700 mb-2"
                htmlFor="primary-lang"
              >
                Primary Language
              </label>
              <select
                className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                id="primary-lang"
                value={primaryLang}
                onChange={(e) => setPrimaryLang(e.target.value)}
              >
                <option>English</option>
                <option>Hindi (हिन्दी)</option>
                <option>Tamil (தமிழ்)</option>
                <option>Telugu (తెలుగు)</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-bold text-gray-700 mb-2"
                htmlFor="secondary-lang"
              >
                Secondary Language (Optional)
              </label>
              <select
                className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 text-sm"
                id="secondary-lang"
                value={secondaryLang}
                onChange={(e) => setSecondaryLang(e.target.value)}
              >
                <option>None</option>
                <option>Hindi (हिन्दी)</option>
                <option>English</option>
                <option>Marathi (మరాठी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d1] flex flex-col xl:col-span-2">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
            <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center">
              <span className="material-symbols-outlined">security</span>
            </div>
            <h2 className="text-lg font-bold text-on-surface">Security Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800">Change Password</h3>

              {passwordFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    passwordFeedback.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordFeedback.message}
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-semibold text-gray-500 mb-1"
                  htmlFor="current-pwd"
                >
                  Current Password
                </label>
                <input
                  className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"
                  id="current-pwd"
                  placeholder="••••••••"
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-gray-500 mb-1"
                  htmlFor="new-pwd"
                >
                  New Password
                </label>
                <input
                  className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"
                  id="new-pwd"
                  placeholder="••••••••"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-gray-500 mb-1"
                  htmlFor="confirm-pwd"
                >
                  Confirm New Password
                </label>
                <input
                  className="block w-full px-3 py-2 border border-[#c3c6d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"
                  id="confirm-pwd"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors text-xs"
              >
                Update Password
              </button>
            </form>

            <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Add an extra layer of security to your account by requiring a
                verification code upon login.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#001e40] text-[32px]">
                    phonelink_lock
                  </span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      SMS Authentication
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      +91 ••••• ••482
                    </p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                  Enabled
                </span>
              </div>

              <button
                type="button"
                onClick={() => console.log("Manage 2FA Settings clicked")}
                className="text-xs font-bold border border-primary text-primary px-4 py-2.5 rounded-lg hover:bg-primary-fixed/30 transition-colors w-full"
              >
                Manage 2FA Settings
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#c3c6d1] flex flex-col xl:col-span-2">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
            <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center">
              <span className="material-symbols-outlined">notifications_active</span>
            </div>
            <h2 className="text-lg font-bold text-on-surface">
              Notification Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SMS Alerts toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">sms</span>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">SMS Alerts</h3>
                  <p className="text-[10px] text-gray-500">Status updates</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="toggle-sms"
                  className="sr-only"
                  checked={smsAlerts}
                  onChange={() => setSmsAlerts(!smsAlerts)}
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    smsAlerts ? "bg-[#003366]" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                    smsAlerts ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </div>

            {/* Email Updates toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">mail</span>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Email Updates</h3>
                  <p className="text-[10px] text-gray-500">Detailed reports</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="toggle-email"
                  className="sr-only"
                  checked={emailUpdates}
                  onChange={() => setEmailUpdates(!emailUpdates)}
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    emailUpdates ? "bg-[#003366]" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                    emailUpdates ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </div>

            {/* WhatsApp toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">forum</span>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">WhatsApp</h3>
                  <p className="text-[10px] text-gray-500">Quick summaries</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="toggle-wa"
                  className="sr-only"
                  checked={whatsappAlerts}
                  onChange={() => setWhatsappAlerts(!whatsappAlerts)}
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    whatsappAlerts ? "bg-[#003366]" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                    whatsappAlerts ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={onBackToDashboard}
          className="text-sm font-semibold border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSettings}
          className="text-sm font-bold bg-[#001e40] text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
