"use client";

import { useEffect } from "react";
import { FeaturesSection } from "./sections/features-section";
import { HeroSection } from "./sections/hero-section";
import { SolutionsSection } from "./sections/solutions-section";
import { PricingSection } from "./sections/pricing-section";
import { ContactSection } from "./sections/contact-section";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function LandingPage() {
  useEffect(() => {
    const scrollToHashSection = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const id = decodeURIComponent(hash.slice(1));
      const section = document.getElementById(id);
      if (!section) return;

      section.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    let rafTwo = 0;
    const rafOne = requestAnimationFrame(() => {
      rafTwo = requestAnimationFrame(scrollToHashSection);
    });

    window.addEventListener("hashchange", scrollToHashSection);

    return () => {
      cancelAnimationFrame(rafOne);
      if (rafTwo) {
        cancelAnimationFrame(rafTwo);
      }
      window.removeEventListener("hashchange", scrollToHashSection);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SolutionsSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </main>
  );
}