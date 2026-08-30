import React from "react";

export default function RegisterForm({
  formData,
  handleChange,
  handleSubmit,
  handleCancel,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-300">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">
          Citizen Registration
        </h2>
        <p className="text-sm text-gray-600">
          Create an account to file and track grievances efficiently.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ================= PERSONAL ================= */}
        <section>
          <h3 className="section-title">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName || ""}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="form-input"
              />
            </div>

            {/* Aadhaar */}
            <div>
              <label htmlFor="aadhaar" className="form-label">
                Aadhaar Number
                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
              </label>
              <input
                id="aadhaar"
                name="aadhaar"
                type="text"
                value={formData.aadhaar || ""}
                onChange={handleChange}
                placeholder="XXXX XXXX XXXX"
                className="form-input"
              />
            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section>
          <h3 className="section-title">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="register-email" className="form-label">
                Email Address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="form-input"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="+91 00000 00000"
                required
                className="form-input"
              />
            </div>
          </div>
        </section>

        {/* ================= LOCATION ================= */}
        <section>
          <h3 className="section-title">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* State */}
            <div>
              <label htmlFor="state" className="form-label">
                State
              </label>
              <div className="relative">
                <select
                  id="state"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                  required
                  className="form-input appearance-none pr-10"
                >
                  <option value="">Select State</option>
                  <option value="dl">Delhi</option>
                  <option value="mh">Maharashtra</option>
                  <option value="ka">Karnataka</option>
                  <option value="tn">Tamil Nadu</option>
                </select>
                <span className="select-icon material-symbols-outlined">
                  expand_more
                </span>
              </div>
            </div>

            {/* District */}
            <div>
              <label htmlFor="district" className="form-label">
                District
              </label>
              <div className="relative">
                <select
                  id="district"
                  name="district"
                  value={formData.district || ""}
                  onChange={handleChange}
                  required
                  className="form-input appearance-none pr-10"
                >
                  <option value="">Select District</option>
                  <option value="3">Chennai</option>
                  <option value="4">Coimbatore</option>
                  <option value="8">Erode</option>
                  <option value="23">Salem</option>
                  <option value="29">Tiruchirappalli</option>
                  <option value="32">Tiruppur</option>
                  <option value="14">Madurai</option>
                </select>
                <span className="select-icon material-symbols-outlined">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECURITY ================= */}
        <section>
          <h3 className="section-title">Preferences & Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div>
              <label htmlFor="language" className="form-label">
                Preferred Language
              </label>
              <div className="relative">
                <select
                  id="language"
                  name="language"
                  value={formData.language || "en"}
                  onChange={handleChange}
                  className="form-input appearance-none pr-10"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="ml">Malayalam</option>
                </select>
                <span className="select-icon material-symbols-outlined">
                  expand_more
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="form-label">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleChange}
                placeholder="Create a secure password"
                required
                className="form-input"
              />
            </div>
          </div>
        </section>

        {/* ================= BUTTONS ================= */}
        <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-container transition-all"
          >
            Register Now
          </button>
        </div>
      </form>
    </div>
  );
}
