import { useState } from "react";

const apps = [
  {
    name: "Fabulous",
    logo: "https://www.thefabulous.co/images/Fabulous-Logo.jpg",
    url: "https://www.thefabulous.co/"
  },
  {
    name: "Healthy Eating",
    logo: "https://www.thefabulous.co/images/Shape-Logo.jpg",
    url: "https://www.thefabulous.co/shape/"
  },
  {
    name: "ADHD Organizer",
    logo: "https://www.thefabulous.co/images/clarify-logo2.jpeg",
    url: "https://www.thefabulous.co/clarify/"
  },
  {
    name: "Find Purpose",
    logo: "https://www.thefabulous.co/images/Elixir-Logo.jpg",
    url: "https://elixir.thefabulous.co/onboarding/elixir-initial?utm_medium=website&utm_source=landing_page"
  },
  {
    name: "Ease Stress",
    logo: "https://www.thefabulous.co/images/img_lumiere_header_landing.png",
    url: "https://mind.thefabulous.co/onboarding/mind-initial?utm_medium=website&utm_source=landing_page"
  },
  {
    name: "Sleep Tracker",
    logo: "https://www.thefabulous.co/images/Mind-Logo.jpg",
    url: "https://sleep.thefabulous.co/onboarding/sleep-initial?utm_medium=website&utm_source=landing_page"
  }
];

export default function TopNavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="hidden md:flex items-center justify-center gap-2 py-3 px-4 bg-white border-b border-border">
        {apps.map((app, index) => (
          <a
            key={index}
            href={app.url}
            className="flex items-center gap-2 px-3 py-2 hover-elevate rounded-md transition-all"
            data-testid={`link-app-${app.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <img src={app.logo} alt={app.name} className="w-8 h-8 rounded-sm" />
            <span className="text-sm text-foreground">{app.name}</span>
          </a>
        ))}
      </div>

      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border">
        <img src="https://www.thefabulous.co/images/logo-black-n.svg" alt="Fabulous" className="h-6" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
          data-testid="button-menu-toggle"
        >
          {isOpen ? (
            <img src="https://www.thefabulous.co/images/close-dark.svg" alt="Close" className="w-6 h-6" />
          ) : (
            <img src="https://www.thefabulous.co/images/open-black.svg" alt="Menu" className="w-6 h-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-foreground/95 z-50 flex flex-col items-center justify-start pt-20 px-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2"
            data-testid="button-menu-close"
          >
            <img src="https://www.thefabulous.co/images/close-white.svg" alt="Close" className="w-6 h-6" />
          </button>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <a href="https://www.thefabulous.co/science-behind-fabulous/" className="text-white text-lg py-2" data-testid="link-science-mobile">
              Science
            </a>
            <a href="https://app.thefabulous.co/login?fab_source=homepage" className="text-white text-lg py-2" data-testid="link-signin-mobile">
              Sign in
            </a>
            <div className="border-t border-white/20 my-4"></div>
            {apps.map((app, index) => (
              <a
                key={index}
                href={app.url}
                className="flex items-center gap-3 py-3"
                data-testid={`link-app-mobile-${app.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <img src={app.logo} alt={app.name} className="w-12 h-12 rounded-md" />
                <span className="text-white text-base">{app.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
