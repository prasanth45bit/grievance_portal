import React from "react";
import Icon from "../common/Icon";

const stats = [
  {
    icon: "description",
    value: "1.2M+",
    label: "Total Complaints",
    iconClass: "text-primary",
  },
  {
    icon: "check_circle",
    value: "945K+",
    label: "Complaints Resolved",
    iconClass: "text-green-600",
  },
  {
    icon: "account_balance",
    value: "150+",
    label: "Active Departments",
    iconClass: "text-orange-600",
  },
  {
    icon: "insights",
    value: "98.5%",
    label: "AI Routing Accuracy",
    iconClass: "text-blue-800",
  },
];

export default function Stats() {
  return (
    <section className="py-12 bg-gray-100 -mt-12 relative z-10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-300 hover:shadow-md transition-shadow group"
            >
              <Icon
                className={`${stat.iconClass} mb-4 text-[32px] group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </Icon>

              <h3 className="text-2xl font-semibold text-primary">
                {stat.value}
              </h3>

              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
