import React from "react";

const roleInfo = {
  citizen: {
    icon: "person",
    title: "Citizen Login",
    description: "Login to file and track your grievances.",
  },
  officer: {
    icon: "badge",
    title: "Nodal Officer Login",
    description: "Access departmental grievance queue.",
  },
  admin: {
    icon: "admin_panel_settings",
    title: "Administrator Login",
    description: "Manage system configurations and users.",
  },
};

const departments = [
  { value: "pwd", label: "Department of Public Works" },
  { value: "health", label: "Department of Health & Family Welfare" },
  { value: "telecom", label: "Department of Telecommunications" },
  { value: "agriculture", label: "Department of Agriculture & Farmers Welfare" },
  { value: "education", label: "Department of Higher Education" },
];

export default function LoginForm({
  role,
  setRole,
  formData,
  handleChange,
  handleSubmit,
  showPassword,
  setShowPassword,
  onSwitchToRegister,
}) {
  const currentInfo = roleInfo[role] || roleInfo.citizen;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-300 p-6 md:p-8">
      {/* Role Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          type="button"
          onClick={() => setRole("citizen")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            role === "citizen"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Citizen
        </button>
        <button
          type="button"
          onClick={() => setRole("officer")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            role === "officer"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Officer
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            role === "admin"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Admin
        </button>
      </div>

      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white mb-4 transition-transform duration-300 transform hover:scale-105">
          <span className="material-symbols-outlined text-[28px]">
            {currentInfo.icon}
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-primary">
          {currentInfo.title}
        </h2>
        <p className="text-sm text-gray-600 mt-2">{currentInfo.description}</p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username/Email Input */}
        {role === "citizen" ? (
          <div>
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              className="form-input"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="login-username" className="form-label">
              {role === "officer" ? "Employee ID / Username" : "Admin ID / Username"}
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              value={formData.username || ""}
              onChange={handleChange}
              placeholder={
                role === "officer"
                  ? "Enter Employee ID"
                  : "Enter Admin Username"
              }
              required
              className="form-input"
            />
          </div>
        )}

        {/* Department Dropdown for Nodal Officers */}
        {role === "officer" && (
          <div>
            <label htmlFor="login-department" className="form-label">
              Department
            </label>
            <div className="relative">
              <select
                id="login-department"
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
                required
                className="form-input appearance-none pr-10"
              >
                <option value="">Select Nodal Department</option>
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
              <span className="select-icon material-symbols-outlined">
                expand_more
              </span>
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="login-password" className="form-label !mb-0">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => console.log("Forgot password clicked for " + role)}
            >
              Forgot Password?
            </button>
          </div>

          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="form-input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <span className="material-symbols-outlined">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 accent-blue-900"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-container transition-all"
        >
          Login as {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
      </form>

      {/* Switch to Register (Citizen Only) */}
      {role === "citizen" && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">Don't have an account?</p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="mt-2 text-sm font-semibold text-primary hover:underline"
          >
            Create Citizen Account
          </button>
        </div>
      )}
    </div>
  );
}
