import { GridPattern } from "@/components/ui/GridPattern";

const features = [
  {
    title: "Agentic AI Coach",
    description:
      "Ria listens to biometric cues, calendar stressors, and journaling tone to forecast cravings 2-4 hours in advance. It changes tone and task difficulty automatically.",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
    badge: "Predictive intelligence",
    reverse: false,
  },
  {
    title: "Dynamic Recovery Canvas",
    description:
      "Layer habit replacements, micro-challenges, and rituals that stretch throughout the day. Ria rearranges blocks when a lapse or schedule conflict hits.",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
    badge: "Adaptive planning",
    reverse: true,
  },
  {
    title: "Crisis + SOS Automations",
    description:
      "When risk spikes, Ria spins up breathing plans, pings accountability partners, and shares location + safety scripts with consented caregivers.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    badge: "Safety posture",
    reverse: false,
  },
  {
    title: "Community Signal Graph",
    description:
      "Group challenges, live rooms, and peer celebrations surface at the perfect cadence. Ria matches you with peers experiencing similar triggers in real-time.",
    image:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=900&q=80",
    badge: "Collective resilience",
    reverse: true,
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-16 md:py-20 bg-zinc-950" id="coach">
      <GridPattern />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex flex-col ${feature.reverse ? "md:flex-row-reverse" : "md:flex-row"
              } items-center gap-8 md:gap-12 lg:gap-16`}
          >
            <div className="w-full md:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-zinc-800">
                <img src={feature.image} alt={feature.title} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.3em] bg-orange-500/20 text-orange-500 ring-1 ring-orange-500/30 mb-4">
                {feature.badge}
              </span>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-lg md:text-xl text-zinc-400">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
