import React from "react";
import Icon from "../common/Icon";

const features = [
  {
    icon: "language",
    title: "Multi-Language Support (Bhashini AI)",
    description:
      "File your grievance in any of the 22 scheduled Indian languages. Our system translates and processes your request instantly while maintaining semantic integrity.",
    className:
      "col-span-12 md:col-span-8 bg-primary-container text-white p-8 rounded-3xl flex flex-col justify-between min-h-[320px] relative overflow-hidden group",
    iconClass: "text-white/60",
  },
  {
    icon: "mic",
    title: "Voice Complaint",
    description:
      "Don't want to type? Use our voice-to-text engine to dictate your grievance. Perfect for users with different literacy levels or physical needs.",
    className:
      "col-span-12 md:col-span-4 bg-orange-400 p-8 rounded-3xl min-h-[320px] group",
    iconClass: "text-orange-900/60",
    titleClass: "text-orange-950",
    descriptionClass: "text-orange-950/80",
  },
  {
    icon: "psychology",
    title: "AI Classification",
    description:
      "Intelligent models analyze the sentiment and core issue of your complaint to ensure it reaches the desk of the right officer immediately.",
    className:
      "col-span-12 md:col-span-4 bg-gray-100 p-8 rounded-3xl min-h-[320px] border border-gray-300 hover:border-blue-900 transition-all",
    iconClass: "text-primary",
    titleClass: "text-primary",
  },
  {
    icon: "upload_file",
    title: "OCR Upload",
    description:
      "Upload images of physical letters or documents. Our AI extracts text automatically, saving you from manual data entry.",
    className:
      "col-span-12 md:col-span-4 bg-gray-100 p-8 rounded-3xl min-h-[320px] border border-gray-300 hover:border-blue-900 transition-all",
    iconClass: "text-primary",
    titleClass: "text-primary",
  },
  {
    icon: "hub",
    title: "Semantic Routing",
    description:
      "Automatically identifies the correct nodal officer based on previous historical resolution data and department jurisdiction.",
    className:
      "col-span-12 md:col-span-4 bg-primary text-white p-8 rounded-3xl min-h-[320px] flex flex-col justify-end",
    iconClass: "text-blue-200",
  },
];

export default function Features() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-3">
            Intelligent Features for Seamless Resolution
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Leveraging India's Bhashini AI and modern tech stacks to bridge
            the gap between citizens and administration.
          </p>
        </div>

        <div className="bento-grid">
          {features.map((feature, index) => (
            <div key={index} className={feature.className}>
              <div className="relative z-10">
                <Icon
                  className={`text-[48px] mb-6 ${feature.iconClass || ""}`}
                >
                  {feature.icon}
                </Icon>

                <h3
                  className={`text-2xl font-semibold mb-3 ${
                    feature.titleClass || ""
                  }`}
                >
                  {feature.title}
                </h3>

                <p
                  className={`leading-6 ${
                    feature.descriptionClass || "text-current/80"
                  } max-w-md`}
                >
                  {feature.description}
                </p>
              </div>

              {index === 0 && (
                <div className="absolute right-0 bottom-0 opacity-20 translate-x-10 translate-y-10 group-hover:translate-x-5 transition-transform duration-700">
                  <Icon className="text-[240px]">translate</Icon>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
