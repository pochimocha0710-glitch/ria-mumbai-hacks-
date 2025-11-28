import { useState, useEffect } from 'react';
import { getLeaderboard, updateLeaderboardPoints } from '@/lib/firebase.config';

export interface LeaderboardEntry {
    id: string;
    userId: string;
    name: string;
    points: number;
    streak: number;
    updatedAt: Date;
}

export function useLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const data = await getLeaderboard(10);
            setLeaderboard(data as LeaderboardEntry[]);
            setError(null);
        } catch (err) {
            setError('Failed to load leaderboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const updatePoints = async (userId: string, points: number, streak: number) => {
        try {
            await updateLeaderboardPoints(userId, points, streak);
            await fetchLeaderboard(); // Refresh leaderboard
        } catch (err) {
            console.error('Failed to update points:', err);
            throw err;
        }
    };

    return {
        leaderboard,
        loading,
        error,
        updatePoints,
        refresh: fetchLeaderboard,
    };
}
