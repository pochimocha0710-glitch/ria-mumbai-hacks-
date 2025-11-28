import { SiInstagram } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center font-semibold text-lg">
                R
              </div>
              <div>
                <p className="text-lg font-semibold">Ria Recovery</p>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Agentic AI</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              An AI-powered recovery companion that anticipates relapse, adapts plans autonomously,
              and mobilizes community + crisis workflows for lasting change.
            </p>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-white">Product</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#product" className="hover:text-white">Overview</a></li>
                <li><a href="#coach" className="hover:text-white">AI Coach</a></li>
                <li><a href="#community" className="hover:text-white">Community</a></li>
                <li><a href="#sos" className="hover:text-white">SOS Toolkit</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-white">Company</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="mailto:team@ria.ai" className="hover:text-white">Contact team</a></li>
                <li><a href="https://forms.gle/ria-demo" className="hover:text-white">Request demo</a></li>
                <li><a href="#" className="hover:text-white">Press kit</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-white">Resources</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white">Safety playbook</a></li>
                <li><a href="#" className="hover:text-white">Clinical brief</a></li>
                <li><a href="#" className="hover:text-white">Security overview</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <span>© {new Date().getFullYear()} Ria Recovery. Built for the Agentic AI Hackathon.</span>
          <a href="https://www.instagram.com" className="flex items-center gap-2 hover:text-white">
            <SiInstagram className="w-5 h-5" />
            <span>@try.ria</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
