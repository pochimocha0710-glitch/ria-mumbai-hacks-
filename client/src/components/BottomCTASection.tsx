import { Button } from "@/components/ui/button";

export default function BottomCTASection() {
  return (
    <section 
      id="sos"
      className="relative py-24 md:py-32 bg-cover bg-center"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(28, 25, 50, 0.9), rgba(99, 102, 241, 0.75)), url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1600&q=80')"
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Bring agentic AI recovery to your demo day
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-8">
          Showcase how Ria watches signals, adapts plans, and mobilizes community allies before
          relapse strikes.
        </p>
        <Button 
          size="lg"
          className="bg-white/20 backdrop-blur-md text-white border-2 border-white hover:bg-white/30 px-8 py-6 text-lg rounded-md"
          data-testid="button-get-started-bottom"
        >
          Book a live walkthrough
        </Button>
      </div>
    </section>
  );
}
