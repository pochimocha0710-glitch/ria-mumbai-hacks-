import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, MessageSquare, ChevronDown } from "lucide-react";
import RiaChat from "@/components/RiaChat";
import { logOut } from "@/lib/firebase.config";

const navItems = [
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "How It Works", href: "/how-it-works" },
];

export default function UnifiedHeader() {
    const [location] = useLocation();
    const { user } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAgentChat, setShowAgentChat] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const isHome = location === "/";

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await logOut();
        setShowProfileMenu(false);
    };

    return (
        <>
            <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <img
                        src="/logoria.gif"
                        alt="Ria logo"
                        className="h-[50px] w-[50px] object-contain"
                    />
                    <span className="text-2xl font-bold text-white drop-shadow">Ria</span>
                </Link>

                <div className="hidden md:flex items-center gap-6 md:gap-8">
                    {navItems.map((item) => (
                        <Link key={item.label} href={item.href} className="text-white/90 hover:text-white transition-colors text-sm md:text-base font-medium drop-shadow cursor-pointer">
                            {item.label}
                        </Link>
                    ))}

                    {/* Agent Chat Button */}
                    {user && (
                        <button
                            onClick={() => setShowAgentChat(!showAgentChat)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Agent
                        </button>
                    )}

                    {user ? (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                <User className="w-4 h-4" />
                                {user.displayName?.split(' ')[0] || 'Profile'}
                                <ChevronDown className="w-3 h-3" />
                            </button>
                            
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden">
                                    <Link 
                                        href="/dashboard"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-800 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile & Dashboard
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-800 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/signin" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer">
                            Sign In
                        </Link>
                    )}
                </div>

                <div className="md:hidden">
                    {user ? (
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white cursor-pointer"
                        >
                            <User className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link href="/signin" className="inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white cursor-pointer">
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>

            {/* Agent Chat Modal */}
            {showAgentChat && user && (
                <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px]">
                    <RiaChat />
                    <button
                        onClick={() => setShowAgentChat(false)}
                        className="absolute top-2 right-2 w-8 h-8 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-zinc-700"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}
