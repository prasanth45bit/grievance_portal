import React from "react";
import Icon from "../common/Icon";

const steps = [
  {
    icon: "person_add",
    title: "Register",
    description: "One-time account creation",
    active: true,
  },
  {
    icon: "edit_document",
    title: "Submit",
    description: "Describe in any language",
    active: true,
  },
  {
    icon: "auto_awesome",
    title: "AI Classification",
    description: "Categorizing your issue",
    active: "processing",
  },
  {
    icon: "route",
    title: "Auto Routing",
    description: "Sent to the right Dept.",
  },
  {
    icon: "visibility",
    title: "Officer Review",
    description: "Verified by authorities",
  },
  {
    icon: "task_alt",
    title: "Resolution",
    description: "Problem solved permanently",
    active: "complete",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-3">
            How it Works
          </h2>

          <p className="text-lg text-gray-600">
            A transparent, end-to-end digital journey from submission to
            solution.
          </p>
        </div>

        <div className="relative mt-20">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-300 -translate-y-1/2 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-6 gap-8 relative">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center space-y-4 relative"
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    z-10 shadow-lg
                    ${
                      step.active === "processing"
                        ? "bg-orange-600 text-white animate-pulse"
                        : step.active === "complete"
                        ? "bg-green-600 text-white"
                        : step.active
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-gray-600"
                    }
                  `}
                >
                  <Icon>{step.icon}</Icon>
                </div>

                <div>
                  <h4
                    className={`text-xl font-semibold ${
                      step.active ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </h4>

                  <p className="text-xs text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
