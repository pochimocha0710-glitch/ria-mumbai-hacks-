import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, Edit, Trash2, Check, Bell, BellOff, Sparkles } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Task } from '@shared/taskSchema';
import { auth } from '@/lib/firebase.config';

export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        scheduledTime: '',
        duration: 30,
        xpReward: 50,
    });

    const { permission, requestPermission, scheduleNotification, isSupported } = useNotifications();
    const userId = auth.currentUser?.uid || '';

    // Fetch tasks
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
    }, [userId]);

    // Schedule notifications for upcoming tasks
    useEffect(() => {
        if (permission !== 'granted' || tasks.length === 0) return;

        const cleanupFunctions: (() => void)[] = [];

        tasks.forEach(task => {
            if (!task.completed && !task.notificationSent) {
                const notificationTime = new Date(task.scheduledTime.getTime() - 5 * 60 * 1000);

                const cleanup = scheduleNotification(
                    `Upcoming Task: ${task.title}`,
                    notificationTime,
                    {
                        body: task.description || `This task is scheduled in 5 minutes`,
                        tag: `task-${task.id}`,
                        data: { taskId: task.id }
                    }
                );

                if (typeof cleanup === 'function') {
                    cleanupFunctions.push(cleanup);
                }
            }
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [tasks, permission, scheduleNotification]);

    const handleAICreateTask = async () => {
        if (!aiInput.trim()) return;

        setAiLoading(true);
        try {
            const response = await fetch('/api/ai/parse-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    prompt: aiInput
                }),
            });

            if (response.ok) {
                const taskData = await response.json();
                // Schedule notification for the task
                if (permission === 'granted' && taskData.scheduledTime) {
                    const notificationTime = new Date(new Date(taskData.scheduledTime).getTime() - 5 * 60 * 1000);
                    scheduleNotification(
                        `Upcoming Task: ${taskData.title}`,
                        notificationTime,
                        {
                            body: taskData.description || `This task is scheduled in 5 minutes`,
                            tag: `task-${taskData.id}`,
                            data: { taskId: taskData.id }
                        }
                    );
                }
                await fetchTasks();
                setShowAIModal(false);
                setAiInput('');
            }
        } catch (error) {
            console.error('Error creating AI task:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.scheduledTime) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    ...newTask,
                    scheduledTime: new Date(newTask.scheduledTime).toISOString(),
                }),
            });

            if (response.ok) {
                const taskData = await response.json();
                // Schedule notification for the task
                if (permission === 'granted' && taskData.scheduledTime) {
                    const notificationTime = new Date(new Date(taskData.scheduledTime).getTime() - 5 * 60 * 1000);
                    scheduleNotification(
                        `Upcoming Task: ${taskData.title}`,
                        notificationTime,
                        {
                            body: taskData.description || `This task is scheduled in 5 minutes`,
                            tag: `task-${taskData.id}`,
                            data: { taskId: taskData.id }
                        }
                    );
                }
                await fetchTasks();
                setShowCreateModal(false);
                setNewTask({
                    title: '',
                    description: '',
                    scheduledTime: '',
                    duration: 30,
                    xpReward: 50,
                });
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...updates,
                    scheduledTime: updates.scheduledTime ? new Date(updates.scheduledTime).toISOString() : undefined,
                }),
            });

            if (response.ok) {
                await fetchTasks();
                setEditingTask(null);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/complete`, {
                method: 'POST',
            });

            if (response.ok) {
                await fetchTasks();
            }
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const getTimeUntil = (scheduledTime: Date) => {
        const now = new Date();
        const diff = scheduledTime.getTime() - now.getTime();

        if (diff < 0) return 'Overdue';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `in ${days} day${days > 1 ? 's' : ''}`;
        }
        if (hours > 0) return `in ${hours}h ${minutes}min`;
        return `in ${minutes}min`;
    };

    if (loading) {
        return <div className="text-white text-center py-8">Loading tasks...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Notification Permission Banner */}
            {isSupported && permission !== 'granted' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <BellOff className="w-5 h-5 text-orange-500" />
                        <div>
                            <div className="text-white font-semibold">Enable Notifications</div>
                            <div className="text-zinc-400 text-sm">Get reminders before your tasks start</div>
                        </div>
                    </div>
                    <button
                        onClick={requestPermission}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                        Enable
                    </button>
                </motion.div>
            )}

            {/* Header with Create Buttons */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAIModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                    >
                        <Sparkles size={20} />
                        AI Assistant
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                        <Plus size={20} />
                        New Task
                    </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400">
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No tasks yet. Create your first task!</p>
                    </div>
                ) : (
                    tasks.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()).map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-zinc-900 rounded-xl p-4 border ${task.completed ? 'border-green-500/30' : 'border-zinc-800'}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className={`text-white font-semibold ${task.completed ? 'line-through opacity-50' : ''}`}>
                                            {task.title}
                                        </h3>
                                        {task.completed && (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full font-semibold">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    {task.description && (
                                        <p className="text-zinc-400 text-sm mb-3">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm flex-wrap">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Calendar size={16} />
                                            {task.scheduledTime.toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Clock size={16} />
                                            {task.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {!task.completed && (
                                            <div className="flex items-center gap-2 text-orange-500 font-semibold">
                                                <Bell size={16} />
                                                {getTimeUntil(task.scheduledTime)}
                                            </div>
                                        )}
                                        <div className="text-orange-500 font-semibold">
                                            +{task.xpReward} XP
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!task.completed && (
                                        <>
                                            <button
                                                onClick={() => setEditingTask(task)}
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} className="text-zinc-400" />
                                            </button>
                                            <button
                                                onClick={() => handleCompleteTask(task.id)}
                                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                            >
                                                <Check size={18} className="text-green-500" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* AI Assistant Modal */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAIModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-zinc-900 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                                <h3 className="text-xl font-bold text-white">AI Task Assistant</h3>
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">
                                Describe your task in natural language, and I'll create it for you!
                            </p>
                            <textarea
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="E.g., 'Remind me to workout tomorrow at 6pm for 45 minutes'"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-purple-500 outline-none resize-none"
                                rows={4}
                                disabled={aiLoading}
                            />
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAIModal(false)}
                                    disabled={aiLoading}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAICreateTask}
                                    disabled={!aiInput.trim() || aiLoading}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            Create Task
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Task Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Create New Task</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-zinc-400 text-sm mb-2">Task Title *</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                        placeholder="Enter task title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-400 text-sm mb-2">Description</label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none resize-none"
                                        rows={3}
                                        placeholder="Optional task description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-400 text-sm mb-2">Scheduled Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={newTask.scheduledTime}
                                        onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-400 text-sm mb-2">Duration (min)</label>
                                        <input
                                            type="number"
                                            value={newTask.duration}
                                            onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })}
                                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                            placeholder="30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-zinc-400 text-sm mb-2">XP Reward</label>
                                        <input
                                            type="number"
                                            value={newTask.xpReward}
                                            onChange={(e) => setNewTask({ ...newTask, xpReward: Number(e.target.value) })}
                                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                            placeholder="50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTask}
                                    disabled={!newTask.title || !newTask.scheduledTime}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Task
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Task Modal */}
            <AnimatePresence>
                {editingTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingTask(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Edit Task</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-zinc-400 text-sm mb-2">Task Title</label>
                                    <input
                                        type="text"
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-400 text-sm mb-2">Description</label>
                                    <textarea
                                        value={editingTask.description || ''}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-400 text-sm mb-2">Scheduled Time</label>
                                    <input
                                        type="datetime-local"
                                        value={new Date(editingTask.scheduledTime).toISOString().slice(0, 16)}
                                        onChange={(e) => setEditingTask({ ...editingTask, scheduledTime: new Date(e.target.value) })}
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-400 text-sm mb-2">Duration (min)</label>
                                        <input
                                            type="number"
                                            value={editingTask.duration || 30}
                                            onChange={(e) => setEditingTask({ ...editingTask, duration: Number(e.target.value) })}
                                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-zinc-400 text-sm mb-2">XP Reward</label>
                                        <input
                                            type="number"
                                            value={editingTask.xpReward}
                                            onChange={(e) => setEditingTask({ ...editingTask, xpReward: Number(e.target.value) })}
                                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditingTask(null)}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateTask(editingTask.id, editingTask)}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
