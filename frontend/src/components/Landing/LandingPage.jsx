import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Stats from "./Stats";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import CTA from "./CTA";
import Footer from "./Footer";

export default function LandingPage({ onLogin, onRegister }) {
  return (
    <div className="bg-white text-gray-900">
      <Header onLogin={onLogin} onRegister={onRegister} />

      <main className="pt-20">
        <Hero onFileComplaint={onLogin} onTrackStatus={onLogin} />
        <Stats />
        <Features />
        <HowItWorks />
        <CTA onRegister={onRegister} />
      </main>

      <Footer />
    </div>
  );
}
