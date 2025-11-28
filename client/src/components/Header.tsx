import { Link, useLocation } from "wouter";
import { Brain, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase.config";

export default function Header() {
    const [location] = useLocation();
    const { user } = useAuth();

    const handleSignOut = () => {
        auth.signOut();
    };

    // Helper to check active state
    const isActive = (path: string) => location === path;

    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl shadow-black/50">
                <Link href="/">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-zinc-950" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">Ria.</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                    <Link href="/">
                        <span className={`cursor-pointer hover:text-white transition-colors ${isActive('/') ? 'text-white' : ''}`}>
                            Home
                        </span>
                    </Link>
                    <Link href="/dashboard">
                        <span className={`cursor-pointer hover:text-white transition-colors ${isActive('/dashboard') ? 'text-white' : ''}`}>
                            Dashboard
                        </span>
                    </Link>
                    <Link href="/leaderboard">
                        <span className={`cursor-pointer hover:text-white transition-colors ${isActive('/leaderboard') ? 'text-white' : ''}`}>
                            Leaderboard
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                                    {user.displayName ? user.displayName[0].toUpperCase() : <User className="w-4 h-4" />}
                                </div>
                                <span className="text-sm font-medium text-white hidden sm:block">
                                    {user.displayName?.split(' ')[0]}
                                </span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="text-zinc-400 hover:text-white transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/signin">
                            <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                <User className="w-4 h-4 text-zinc-400" />
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
