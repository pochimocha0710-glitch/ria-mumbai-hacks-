import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import AgenticAnimation from "@/components/AgenticAnimation";
import UserOnboarding from "@/components/UserOnboarding";
import UnifiedHeader from "@/components/UnifiedHeader";
import { useAuth } from "@/contexts/AuthContext";

const options = [
  "Quit nicotine cravings",
  "Stay sober and steady",
  "Ease phone & dopamine spikes",
  "Navigate stress triggers",
  "All of the above"
];

const navItems = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Agent", href: "/agent" },
  { label: "How It Works", href: "/how-it-works" },
];

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    console.log('Selected:', option);
  };

  const handleStartJourney = () => {
    if (!user) {
      // Redirect to sign in if not logged in
      setLocation('/signin');
      return;
    }
    // Show onboarding directly
    setShowOnboarding(true);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setLocation('/dashboard');
  };

  return (
    <section className="relative overflow-hidden min-h-screen">
      <div className="absolute inset-0">
        <img
          src="/mainbg1.png"
          alt="Ria agentic recovery background"
          className="h-full w-full object-cover"
        />
      </div>

      <UnifiedHeader />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white drop-shadow py-16 md:py-24 lg:py-32">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 text-sm font-semibold text-white ring-1 ring-white/30 mb-6 backdrop-blur">
          Agentic AI Recovery · Hackathon Showcase
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 leading-tight">
          Meet Ria your proactive AI companion that keeps you ahead of relapse
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
          {[
            { title: "Agentic AI Coach", desc: "Predicts cravings and adapts intensity daily." },
            { title: "360° Recovery Plan", desc: "Routines, habit swaps, and crisis workflows." },
            { title: "Always-on Support", desc: "Escalates to SOS or community allies instantly." },
          ].map((item, index) => (
            <div
              key={item.title}
              className="rounded-2xl bg-black/40 text-white/95 p-5 shadow-lg ring-1 ring-white/10 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/80 mb-2">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-white/80">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
            What should Ria help you prevent first?
          </h2>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-black/40 border border-white/20 rounded-md px-4 py-3 text-left flex items-center justify-between hover-elevate backdrop-blur"
              data-testid="button-dropdown-toggle"
            >
              <span className="text-white">{selected || "Choose your answer"}</span>
              <ChevronDown className={`w-5 h-5 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="absolute z-10 w-full mt-2 bg-black/70 border border-white/10 rounded-md shadow-lg backdrop-blur">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 text-white first:rounded-t-md last:rounded-b-md"
                    data-testid={`option-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleStartJourney}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-md shadow-lg shadow-orange-200"
          data-testid="button-start-journey"
        >
          Start My Journey
        </Button>
        <p className="mt-4 text-sm text-white/80">
          Built with modern React + Vite. Optimized for Agentic AI Hackathon 2025.
        </p>
      </div>

      {/* Agentic Animation & Onboarding */}
      <AnimatePresence>
        {showAnimation && <AgenticAnimation onComplete={handleAnimationComplete} />}
      </AnimatePresence>

      {showOnboarding && user && (
        <UserOnboarding isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
      )}
    </section>
  );
}
