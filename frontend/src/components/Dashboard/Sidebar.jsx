import React from "react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  navItems,
  onNavItemClick,
}) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-64
          bg-gray-100
          shadow-md
          flex flex-col
          py-6
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">CPGRAMS</h1>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 mb-8">
          <div className="bg-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Welcome, Citizen</p>
                <p className="text-xs text-gray-600">Grievance ID: 2024/9912</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (onNavItemClick) onNavItemClick(item.label);
                setSidebarOpen(false);
              }}
              className={`
                w-[calc(100%-16px)]
                mx-2
                flex items-center gap-3
                px-4 py-3
                rounded-lg
                text-left
                transition-all
                ${
                  item.active
                    ? "bg-primary-container text-white font-bold"
                    : "text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 mt-auto">
          <button
            onClick={() => console.log("Help")}
            className="w-full bg-orange-500 text-orange-950 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-bold shadow-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm">Need Help?</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 text-gray-600 px-4 py-3 mt-2 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
