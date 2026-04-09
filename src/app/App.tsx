import React from "react";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { HeroConsultSection } from "./components/HeroConsultSection";
import { EventSection } from "./components/EventSection";
import { Event2Section } from "./components/Event2Section";
import { AwardsSection } from "./components/AwardsSection";
import { InsuranceSection } from "./components/InsuranceSection";
import { ProductionSection } from "./components/ProductionSection";
import { BrandsSection } from "./components/BrandsSection";
import { MaterialsSection } from "./components/MaterialsSection";
import { GlassTypeSection } from "./components/GlassTypeSection";
import { SafetyNetSection } from "./components/SafetyNetSection";
import { OneDayInstallationSection } from "./components/OneDayInstallationSection";
import { WarrantySection } from "./components/WarrantySection";
import { ReviewSection } from "./components/ReviewSection";
import { CorporateValueSection } from "./components/CorporateValueSection";
import { Footer } from "./components/Footer";
import { BottomBar } from "./components/BottomBar";

export default function App() {
  return (
    <div className="relative w-full min-h-screen pb-[70px] md:pb-[80px] bg-white font-['Pretendard',sans-serif] overflow-x-hidden selection:bg-[#d22727] selection:text-white">
      <Navigation />
      <main className="w-full h-full flex flex-col">
        <div id="hero">
          <HeroSection />
        </div>
        <HeroConsultSection />
        <div id="event">
          <EventSection />
        </div>
        <div id="event2">
          <Event2Section />
        </div>
        <div id="awards">
          <AwardsSection />
        </div>
        <div id="insurance">
          <InsuranceSection />
        </div>
        <div id="production">
          <ProductionSection />
        </div>
        <div id="brands">
          <BrandsSection />
        </div>
        <div id="materials">
          <MaterialsSection />
        </div>
        <div id="glass">
          <GlassTypeSection />
        </div>
        <div id="safety">
          <SafetyNetSection />
        </div>
        <div id="installation">
          <OneDayInstallationSection />
        </div>
        <div id="warranty">
          <WarrantySection />
        </div>
        <div id="review">
          <ReviewSection />
        </div>
        <div id="corporate">
          <CorporateValueSection />
        </div>
      </main>
      <Footer />
      <BottomBar />
    </div>
  );
}