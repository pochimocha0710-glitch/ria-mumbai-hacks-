import HeroSection from "@/components/HeroSection";
import AwardsSection from "@/components/AwardsSection";
import AIFeaturesPreview from "@/components/AIFeaturesPreview";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import ScienceSection from "@/components/ScienceSection";
import FAQSection from "@/components/FAQSection";
import CommunitySection from "@/components/CommunitySection";
import BottomCTASection from "@/components/BottomCTASection";
import Footer from "@/components/Footer";

import { GridPattern } from "@/components/ui/GridPattern";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <HeroSection />

      <div className="relative">
        <GridPattern />
        <div className="relative z-10">
          <AwardsSection />
          <AIFeaturesPreview />
          <FeaturesSection />
          <AboutSection />
          <ScienceSection />
          <FAQSection />
        </div>
      </div>
    </div>
  );
}
