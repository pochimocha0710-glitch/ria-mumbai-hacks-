import { motion } from "framer-motion";
import { Trophy, TrendingUp, Award, Star, Flame, User } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { BentoCard } from "@/components/ui/BentoCard";
import { GridPattern } from "@/components/ui/GridPattern";

// Helper function to get initials from name
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export default function Leaderboard() {
    const { leaderboard: rawLeaderboard, loading, error } = useLeaderboard();
    const { user } = useAuth();

    // Mock data if leaderboard is empty
    const mockLeaderboard = [
        { name: "Alex Chen", points: 12500, streak: 45 },
        { name: "Sarah Jones", points: 11200, streak: 32 },
        { name: "Mike Ross", points: 10800, streak: 28 },
        { name: "Emily Wong", points: 9500, streak: 15 },
        { name: "David Kim", points: 8900, streak: 12 },
        { name: "Jessica Lee", points: 8200, streak: 10 },
        { name: "Tom Wilson", points: 7500, streak: 8 },
        { name: "Lisa Brown", points: 6800, streak: 5 },
        { name: "Chris Taylor", points: 5400, streak: 3 },
        { name: "Anna White", points: 4200, streak: 2 },
    ];

    const leaderboard = rawLeaderboard.length > 0 ? rawLeaderboard : mockLeaderboard;

    // Add rank to leaderboard entries
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        initials: getInitials(entry.name),
        score: entry.points,
    }));

    return (
        <div className="min-h-screen py-20 px-4 relative">
            <GridPattern />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                        Community <span className="text-zinc-500">Leaderboard</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        See how you rank against others on their wellness journey. Compete, motivate, and celebrate together!
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <BentoCard className="p-6 flex flex-col items-center text-center" hoverEffect={true}>
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 text-orange-500">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {loading ? '...' : Math.max(...rankedLeaderboard.map(u => u.streak), 0)}
                        </div>
                        <div className="text-zinc-500 text-sm uppercase tracking-wider font-medium">Longest Streak</div>
                    </BentoCard>

                    <BentoCard className="p-6 flex flex-col items-center text-center" hoverEffect={true}>
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-white">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {loading ? '...' : rankedLeaderboard.length}
                        </div>
                        <div className="text-zinc-500 text-sm uppercase tracking-wider font-medium">Active Users</div>
                    </BentoCard>

                    <BentoCard className="p-6 flex flex-col items-center text-center" hoverEffect={true}>
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white">
                            <Award className="w-6 h-6" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {loading ? '...' : Math.max(...rankedLeaderboard.map(u => u.points), 0).toLocaleString()}
                        </div>
                        <div className="text-zinc-500 text-sm uppercase tracking-wider font-medium">Top Score</div>
                    </BentoCard>
                </div>

                {/* Leaderboard Table */}
                <BentoCard className="overflow-hidden" hoverEffect={false}>
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <h2 className="text-xl font-bold text-white">
                            Top Performers This Month
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-900/30 border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Streak
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                            Loading leaderboard...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : rankedLeaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                            No leaderboard entries yet. Be the first!
                                        </td>
                                    </tr>
                                ) : rankedLeaderboard.map((user, index) => (
                                    <motion.tr
                                        key={user.rank}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                        className={`hover:bg-zinc-800/50 transition-colors ${user.rank <= 3 ? 'bg-orange-500/5' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className={`text-xl font-bold ${user.rank === 1 ? 'text-orange-500' :
                                                    user.rank === 2 ? 'text-zinc-300' :
                                                        user.rank === 3 ? 'text-zinc-400' :
                                                            'text-zinc-600'
                                                    }`}>
                                                    #{user.rank}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.rank === 1 ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                    {user.initials}
                                                </div>
                                                <span className="font-semibold text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Flame className="w-4 h-4 text-orange-500" />
                                                <span className="font-medium text-zinc-300">{user.streak} days</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-orange-500" />
                                                <span className="font-bold text-white">{user.score.toLocaleString()}</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </BentoCard>

                {/* How Points Work */}
                <BentoCard className="mt-12 p-8" hoverEffect={false}>
                    <h3 className="text-2xl font-bold mb-8 text-white">How to Earn Points</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { id: 1, title: 'Daily Check-ins', desc: 'Complete your daily tasks and maintain your streak (+100 points/day)' },
                            { id: 2, title: 'Perfect Form', desc: 'Achieve 90%+ form quality in posture checks (+50 points/session)' },
                            { id: 3, title: 'Mood Improvement', desc: 'Show consistent positive mood changes (+30 points/day)' },
                            { id: 4, title: 'Milestone Achievements', desc: 'Complete 7, 14, 21, and 30-day milestones (+500 bonus points)' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className="bg-zinc-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 border border-zinc-700">
                                    {item.id}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                                    <p className="text-sm text-zinc-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </BentoCard>
            </div>
        </div>
    );
}
