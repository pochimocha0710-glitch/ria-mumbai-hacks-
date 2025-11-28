import { Button } from "@/components/ui/button";

export default function CommunitySection() {
  return (
    <section
      id="community"
      className="relative py-24 md:py-32 bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(24, 23, 41, 0.85), rgba(15, 118, 110, 0.75)), url('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1400&q=80')",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Community signal loops keep you engaged, not judged
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-8">
          Ria clusters members by shared triggers and surfaces micro-challenges, live rooms, and
          celebration reels exactly when motivation dips.
        </p>
        <Button
          size="lg"
          className="bg-white/20 backdrop-blur-md text-white border-2 border-white hover:bg-white/40 px-8 py-6 text-lg rounded-md"
          data-testid="button-get-started-community"
        >
          Explore signal graph
        </Button>
      </div>
    </section>
  );
}
