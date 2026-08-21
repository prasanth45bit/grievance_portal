import React from "react";

export default function CTA({ onRegister }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-blue-900 rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">
              Ready to voice your concern?
            </h2>

            <p className="text-lg text-white/80">
              Join millions of citizens who have found solutions through our
              portal.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="cta-primary" onClick={onRegister}>
              Start Registration
            </button>

            <button className="cta-secondary">Help Center</button>
          </div>
        </div>
      </div>
    </section>
  );
}
