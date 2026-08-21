import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Auth({ initialIsLogin = true, onBackToHome, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] = useState("citizen");
  const [formData, setFormData] = useState({
    fullName: "",
    aadhaar: "",
    email: "",
    phone: "",
    state: "",
    district: "",
    language: "en",
    password: "",
    username: "",
    department: "",
  });

  useEffect(() => {
    setIsLogin(initialIsLogin);
    setRole("citizen"); // reset role on page navigate
  }, [initialIsLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      if (role === "citizen") {
        const loginData = {
          email: formData.email,
          password: formData.password,
        };
        console.log("Login Citizen:", loginData);
        if (onLoginSuccess) onLoginSuccess("citizen");
      } else if (role === "officer") {
        const loginData = {
          username: formData.username,
          department: formData.department,
          password: formData.password,
        };
        console.log("Login Officer:", loginData);
        if (onLoginSuccess) onLoginSuccess("officer");
      } else if (role === "admin") {
        const loginData = {
          username: formData.username,
          password: formData.password,
        };
        console.log("Login Admin:", loginData);
        if (onLoginSuccess) onLoginSuccess("admin");
      }
    } else {
      console.log("Register Citizen:", formData);
      if (onLoginSuccess) onLoginSuccess("citizen");
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      aadhaar: "",
      email: "",
      phone: "",
      state: "",
      district: "",
      language: "en",
      password: "",
      username: "",
      department: "",
    });
    if (onBackToHome) {
      onBackToHome();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b border-gray-300 shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-20">
          <div
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onBackToHome}
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <h1 className="text-xl font-bold text-primary">CPGRAMS Portal</h1>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <span className="material-symbols-outlined">language</span>
            <span className="text-xs hidden md:block">English</span>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-grow">
        {isLogin ? (
          /* ================= LOGIN ================= */
          <div className="flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
              <LoginForm
                role={role}
                setRole={setRole}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onSwitchToRegister={() => {
                  setIsLogin(false);
                  setFormData({
                    fullName: "",
                    aadhaar: "",
                    email: "",
                    phone: "",
                    state: "",
                    district: "",
                    language: "en",
                    password: "",
                    username: "",
                    department: "",
                  });
                }}
              />

              {/* Security Banner */}
              <div className="mt-4 bg-white border border-gray-300 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-orange-500">
                  shield_person
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    Secure Login
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Your credentials are securely encrypted and protected using
                    government security protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= REGISTER ================= */
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Registration Form */}
              <div className="lg:col-span-7 xl:col-span-8">
                <RegisterForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  handleCancel={handleCancel}
                />
              </div>

              {/* Benefits Info Panel */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                <div className="bg-primary-container rounded-xl shadow-md p-6 text-white overflow-hidden relative">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary rounded-full opacity-20 blur-2xl" />
                  <h3 className="text-2xl font-semibold mb-6 relative z-10">
                    Why Register?
                  </h3>
                  <ul className="space-y-6 relative z-10">
                    {/* AI Tracking */}
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">
                          rocket_launch
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">
                          AI-Powered Tracking
                        </h4>
                        <p className="text-sm opacity-90">
                          Get intelligent insights on expected resolution times
                          based on historical data.
                        </p>
                      </div>
                    </li>

                    {/* SMS */}
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">sms</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">
                          Real-time SMS Updates
                        </h4>
                        <p className="text-sm opacity-90">
                          Receive instant notifications on your registered
                          mobile number for every status change.
                        </p>
                      </div>
                    </li>

                    {/* History */}
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">
                          history
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">
                          Centralized History
                        </h4>
                        <p className="text-sm opacity-90">
                          Access and manage all your past and current
                          grievances in one unified dashboard.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Privacy Warning */}
                <div className="bg-white border border-gray-300 rounded-xl p-6 flex items-center gap-4">
                  <span className="material-symbols-outlined text-orange-500 text-4xl">
                    shield_person
                  </span>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Data Privacy Assured
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Your information is encrypted and securely stored
                      following government protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Switch to Login */}
            <div className="text-center mt-6">
              <span className="text-sm text-gray-600">
                Already have an account?
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setFormData({
                    fullName: "",
                    aadhaar: "",
                    email: "",
                    phone: "",
                    state: "",
                    district: "",
                    language: "en",
                    password: "",
                    username: "",
                    department: "",
                  });
                }}
                className="ml-2 text-sm font-semibold text-primary hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-primary text-white w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">CPGRAMS</h2>
            <p className="text-xs text-blue-200 border-l border-blue-300 pl-3">
              © 2024 Department of Administrative Reforms & Public Grievances
              (DARPG)
            </p>
          </div>

          <nav className="flex flex-wrap gap-5">
            <a href="#" className="footer-link">
              RTI
            </a>
            <a href="#" className="footer-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-link">
              Terms & Conditions
            </a>
            <a href="#" className="footer-link">
              Help Desk
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
