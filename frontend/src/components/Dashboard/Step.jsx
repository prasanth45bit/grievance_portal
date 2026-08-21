import React from "react";

export default function Step({
  number,
  title,
  active,
  current,
  completed,
}) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[#f9f9fe] px-2">
      <div
        className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          font-bold
          transition-all duration-300
          ${
            completed
              ? "bg-green-600 text-white"
              : active
              ? "bg-[#001e40] text-white"
              : "bg-[#e2e2e7] text-gray-600"
          }
          ${
            current
              ? "ring-4 ring-[#003366]/30 ring-offset-2"
              : ""
          }
        `}
      >
        {completed ? (
          <span className="material-symbols-outlined text-[20px]">check</span>
        ) : (
          <span className="material-symbols-outlined">{number}</span>
        )}
      </div>

      <span
        className={`
          text-xs font-medium text-center whitespace-nowrap
          ${
            active
              ? "text-[#001e40] font-bold"
              : "text-gray-500"
          }
        `}
      >
        {title}
      </span>
    </div>
  );
}
