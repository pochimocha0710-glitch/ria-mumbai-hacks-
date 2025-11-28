const navItems = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Agent", href: "#coach" },
  { label: "How It Works", href: "/how-it-works" },
];

export default function MainNavigation() {
  return (
    <nav className="bg-transparent backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <a href="/" data-testid="link-logo" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-rose-500 text-white font-semibold flex items-center justify-center shadow-md">
            R
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-white drop-shadow">Ria Recovery</span>
            <span className="text-xs uppercase tracking-[0.25em] text-white/80 drop-shadow">Agentic AI</span>
          </div>
        </a>
        <div className="hidden md:flex items-center gap-6 md:gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-white/90 hover:text-white transition-colors text-sm md:text-base font-medium drop-shadow"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/signin"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            data-testid="link-signin"
          >
            Sign In
          </a>
        </div>
        <a
          href="/signin"
          className="md:hidden inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white"
        >
          Sign In
        </a>
      </div>
    </nav>
  );
}
