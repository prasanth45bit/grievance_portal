import React from "react";
import Icon from "../common/Icon";

export default function Hero({ onFileComplaint, onTrackStatus }) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-primary text-white py-24 md:py-32"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="hero-pattern absolute inset-0" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 rounded-full text-sm">
            <Icon className="text-[18px]">verified</Icon>
            Empowering Citizens via AI
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Digital India Multi-Lingual Public Grievance{" "}
            <span className="text-blue-300 bg-blue-950 px-2">
              Redressal Portal
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-xl leading-7">
            Submit grievances in your preferred language. Our advanced AI
            automatically understands your complaint and routes it to the
            correct government department for faster resolution.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <button className="primary-action-button" onClick={onFileComplaint}>
              <Icon>add_box</Icon>
              File Complaint
            </button>

            <button className="secondary-action-button" onClick={onTrackStatus}>
              <Icon>location_on</Icon>
              Track Status
            </button>
          </div>
        </div>

        {/* Grievance card */}
        <div className="relative hidden md:block">
          <div className="absolute -inset-4 bg-blue-800 blur-3xl opacity-20" />

          <div className="relative glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                  <Icon>person</Icon>
                </div>

                <div>
                  <p className="text-xs opacity-60">Latest Grievance</p>
                  <p className="text-xl font-semibold text-blue-900">
                    ID: 2024/9912
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-orange-200 text-orange-900 text-xs font-bold">
                In Progress
              </span>
            </div>

            <div className="p-6 bg-gray-100 rounded-xl">
              <div className="flex gap-3 items-start">
                <Icon className="text-primary">chat_bubble</Icon>
                <p className="text-gray-800">
                  "मेरे गाँव की सड़क खराब है..." (My village road is in bad
                  condition...)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-blue-900">
              <Icon>auto_awesome</Icon>
              <p className="text-sm font-medium">
                AI identified: Department of Public Works
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
