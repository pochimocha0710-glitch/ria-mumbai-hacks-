import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Sparkles, Loader2, Clock, Award, Check } from 'lucide-react';
import { auth } from '@/lib/firebase.config';
import type { Task } from '@shared/taskSchema';

export default function WeeklyPlanner() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const userId = auth.currentUser?.uid || '';

    const fetchTasks = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`/api/tasks/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setTasks(data.map((t: any) => ({
                    ...t,
                    scheduledTime: new Date(t.scheduledTime)
                })));
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        // Refresh tasks every 30 seconds to keep calendar updated
        const interval = setInterval(() => {
            fetchTasks();
        }, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const generateWeeklyPlan = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/planner/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    preferences: 'Wellness, productivity, and mindfulness'
                }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchTasks();
            }
        } catch (error) {
            console.error('Error generating plan:', error);
        } finally {
            setGenerating(false);
        }
    };

    const getNext7Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const getTasksForDate = (date: Date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.scheduledTime);
            return (
                taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const days = getNext7Days();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (loading) {
        return <div className="text-white text-center py-8">Loading planner...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header - Enhanced Visibility */}
            <div className="flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-purple-500/10 p-6 rounded-2xl border border-orange-500/20">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                        <CalendarIcon className="w-8 h-8 text-orange-500" />
                        Weekly Planner
                    </h2>
                    <p className="text-zinc-300 text-base mt-1">
                        {tasks.length > 0 
                            ? `${tasks.length} tasks scheduled for the next 7 days`
                            : 'AI-generated tasks for the next 7 days'
                        }
                    </p>
                </div>
                <button
                    onClick={generateWeeklyPlan}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Auto-Generate Plan
                        </>
                    )}
                </button>
            </div>

            {/* Calendar Grid - Enhanced Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {days.map((date, index) => {
                    const dayTasks = getTasksForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const completedTasks = dayTasks.filter(t => t.completed).length;
                    const totalXP = dayTasks.reduce((sum, t) => sum + (t.completed ? t.xpReward : 0), 0);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl border-2 p-5 min-h-[250px] shadow-lg transition-all hover:scale-105 ${
                                isToday 
                                    ? 'border-orange-500 shadow-orange-500/20 ring-2 ring-orange-500/30' 
                                    : dayTasks.length > 0
                                    ? 'border-purple-500/30 shadow-purple-500/10'
                                    : 'border-zinc-800'
                            }`}
                        >
                            {/* Day Header */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        {daysOfWeek[date.getDay()]}
                                    </span>
                                    {isToday && (
                                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-xs rounded-full font-semibold">
                                            Today
                                        </span>
                                    )}
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    {date.getDate()}
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {date.toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                            </div>

                            {/* Stats */}
                            {dayTasks.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                                        <Check className="w-3 h-3" />
                                        {completedTasks}/{dayTasks.length}
                                    </div>
                                    {totalXP > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-orange-500 font-semibold">
                                            <Award className="w-3 h-3" />
                                            +{totalXP}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tasks - Enhanced Visibility */}
                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                {dayTasks.length === 0 ? (
                                    <div className="text-center py-6 text-zinc-500 text-sm">
                                        <CalendarIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        No tasks scheduled
                                    </div>
                                ) : (
                                    dayTasks.slice(0, 4).map((task) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`text-sm rounded-lg p-3 border transition-all hover:scale-105 ${
                                                task.completed
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-green-500/20'
                                                    : 'bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 border-zinc-700 text-zinc-200 hover:border-purple-500/50'
                                            }`}
                                        >
                                            <div className={`font-semibold mb-1.5 ${task.completed ? 'line-through opacity-70' : ''}`}>
                                                {task.title}
                                            </div>
                                            {task.description && (
                                                <div className="text-xs text-zinc-400 mb-1.5 line-clamp-1">
                                                    {task.description}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs">
                                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                                <span className="text-zinc-400">
                                                    {task.scheduledTime.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {!task.completed && (
                                                    <span className="ml-auto text-orange-500 font-semibold">
                                                        +{task.xpReward} XP
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                {dayTasks.length > 4 && (
                                    <div className="text-xs text-center text-purple-400 pt-2 font-semibold">
                                        +{dayTasks.length - 4} more tasks
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State */}
            {tasks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800"
                >
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500 opacity-50" />
                    <h3 className="text-white font-semibold mb-2">No Weekly Plan Yet</h3>
                    <p className="text-zinc-400 text-sm mb-4">
                        Click "Auto-Generate Plan" to let AI create your weekly schedule
                    </p>
                </motion.div>
            )}
        </div>
    );
}
