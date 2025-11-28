import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Settings, User as UserIcon, Zap } from 'lucide-react';
import { auth, getUserProfile } from '@/lib/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import UserOnboarding from '@/components/UserOnboarding';
import UnifiedHeader from '@/components/UnifiedHeader';
import CameraTools from '@/components/CameraTools';
import TaskManager from '@/components/TaskManager';
import WeeklyPlanner from '@/components/WeeklyPlanner';

// UI Components
const BentoCard = ({ children, className = "", hoverEffect = true }: { children: React.ReactNode, className?: string, hoverEffect?: boolean }) => (
    <motion.div
        whileHover={hoverEffect ? { scale: 1.02 } : {}}
        className={`bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl overflow-hidden ${className}`}
    >
        {children}
    </motion.div>
);

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'mood' | 'posture' | 'tasks' | 'planner'>('mood');
    const [cameraTab, setCameraTab] = useState<'mood' | 'posture'>('mood');
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Auth & Profile Loading
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const profile = await getUserProfile(currentUser.uid);
                    if (profile) {
                        setUser({ ...currentUser, ...profile });
                        // Check if onboarding is needed
                        if (!profile.onboardingCompleted) {
                            setShowOnboarding(true);
                        }
                    } else {
                        // New user without profile
                        setUser(currentUser);
                        setShowOnboarding(true);
                    }
                } catch (error) {
                    console.error("Error loading profile:", error);
                }
            } else {
                setLocation('/');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setLocation]);

    // Sync camera tab with main tab when mood/posture is selected
    useEffect(() => {
        if (activeTab === 'mood' || activeTab === 'posture') {
            setCameraTab(activeTab);
        }
    }, [activeTab]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <>
            <UnifiedHeader />
            <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">
                            Welcome back, <span className="text-orange-500">{user?.displayName?.split(' ')[0] || 'User'}</span>
                        </h1>
                        <p className="text-zinc-400 mt-2">Ready to optimize your wellness today?</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT SIDE: User Profile (30%) */}
                        <div className="lg:col-span-4 space-y-6">
                            <BentoCard className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-2xl font-bold text-white">
                                        {user?.displayName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">{user?.displayName || 'User'}</div>
                                        <div className="text-orange-500 font-medium">Level {user?.level || 1}</div>
                                    </div>
                                </div>

                                {/* XP Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-400">XP Progress</span>
                                        <span className="text-white">{user?.xp || 0} / {((user?.level || 1) * 500)}</span>
                                    </div>
                                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 transition-all duration-500"
                                            style={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                        <div className="text-zinc-500 text-xs">Age</div>
                                        <div className="text-white font-bold">{user?.age || '-'}</div>
                                    </div>
                                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                        <div className="text-zinc-500 text-xs">Weight</div>
                                        <div className="text-white font-bold">{user?.weight || '-'} kg</div>
                                    </div>
                                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                        <div className="text-zinc-500 text-xs">Height</div>
                                        <div className="text-white font-bold">{user?.height || '-'} cm</div>
                                    </div>
                                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                        <div className="text-zinc-500 text-xs">Streak</div>
                                        <div className="text-white font-bold">{user?.streak || 0} 🔥</div>
                                    </div>
                                </div>
                            </BentoCard>

                            {/* Recent Achievements */}
                            <BentoCard className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-orange-500" />
                                    Recent Achievements
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white text-sm font-medium">7-Day Streak</div>
                                            <div className="text-zinc-500 text-xs">+100 XP</div>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <Trophy className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white text-sm font-medium">10 Tasks Completed</div>
                                            <div className="text-zinc-500 text-xs">+50 XP</div>
                                        </div>
                                    </div>
                                </div>
                            </BentoCard>
                        </div>

                        {/* RIGHT SIDE: Weekly Calendar & Detection Features (70%) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Weekly Calendar - Always Visible */}
                            <BentoCard className="p-6" hoverEffect={false}>
                                <WeeklyPlanner />
                            </BentoCard>

                            {/* Tab Selector */}
                            <div className="flex gap-3">
                                <div className="flex gap-4 mb-8">
                                    {['mood', 'posture', 'tasks'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as 'mood' | 'posture' | 'tasks')}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === tab
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                }`}
                                        >
                                            {tab === 'mood' && 'Mood Detection'}
                                            {tab === 'posture' && 'Posture Detection'}
                                            {tab === 'tasks' && 'Tasks'}
                                        </button>
                                    ))}
                                </div>

                                {/* Camera View - Using CameraTools Component */}
                                {(activeTab === 'mood' || activeTab === 'posture') && (
                                    <CameraTools
                                        activeTab={cameraTab}
                                        setActiveTab={setCameraTab}
                                    />
                                )}

                                {/* Tasks Tab */}
                                {activeTab === 'tasks' && (
                                    <BentoCard className="p-8" hoverEffect={false}>
                                        <TaskManager />
                                    </BentoCard>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Onboarding Modal */}
                {showOnboarding && user && (
                    <UserOnboarding
                        isOpen={showOnboarding}
                        onComplete={() => {
                            setShowOnboarding(false);
                            // Refresh profile
                            getUserProfile(user.uid).then(profile => {
                                if (profile) setUser({ ...user, ...profile });
                            });
                        }}
                    />
                )}
            </div>
        </>
    );
}
