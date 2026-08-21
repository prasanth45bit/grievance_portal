import React from "react";

export default function TopNavbar({ search, setSearch, setSidebarOpen }) {
  return (
    <header className="h-20 bg-white border-b border-gray-300 sticky top-0 z-30 shadow-sm flex justify-between items-center px-4 md:px-8">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Mobile menu */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <h2 className="text-lg md:text-xl font-bold text-primary">
          Citizen Dashboard
        </h2>

        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grievance ID..."
            className="w-80 bg-gray-100 border border-gray-300 rounded-full px-12 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            search
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Language */}
        <button className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-primary">
          <span className="material-symbols-outlined">language</span>
          <span className="text-sm">English</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>

        {/* Accessibility */}
        <button className="hidden sm:block p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <span className="material-symbols-outlined">accessibility_new</span>
        </button>

        {/* Notifications */}
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full" />
        </button>

        <div className="h-8 w-px bg-gray-300 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold">Ravi Kumar</p>
            <p className="text-xs text-gray-500">Citizen Account</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold border-2 border-primary">
            RK
          </div>
        </div>
      </div>
    </header>
  );
}
