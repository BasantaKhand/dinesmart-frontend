import { FeaturesSection } from "./sections/features-section";
import { HeroSection } from "./sections/hero-section";
import { SolutionsSection } from "./sections/solutions-section";
import { ContactSection } from "./sections/contact-section";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SolutionsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}