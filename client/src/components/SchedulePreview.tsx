interface SchedulePreviewProps {
    goals: string[];
    daysPerWeek: number;
    sessionLength: number;
}

interface ScheduleBlock {
    day: string;
    time: string;
    activity: string;
    duration: number;
    color: string;
}

export default function SchedulePreview({ goals, daysPerWeek, sessionLength }: SchedulePreviewProps) {
    // Generate sample schedule based on inputs
    const generateSchedule = (): ScheduleBlock[] => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const activities = [
            { name: 'Morning Stretch', color: 'bg-orange-500' },
            { name: 'Posture Check-in', color: 'bg-zinc-600' },
            { name: 'Evening Walk', color: 'bg-amber-500' },
            { name: 'Mindfulness Session', color: 'bg-emerald-500' },
            { name: 'Gym Workout', color: 'bg-zinc-500' },
            { name: 'Sleep Routine', color: 'bg-orange-400' },
        ];

        const schedule: ScheduleBlock[] = [];
        const selectedDays = days.slice(0, daysPerWeek);

        selectedDays.forEach((day, index) => {
            const activity = activities[index % activities.length];
            const hour = 7 + (index * 2) % 12;
            schedule.push({
                day,
                time: `${hour}:00 AM`,
                activity: activity.name,
                duration: sessionLength,
                color: activity.color,
            });
        });

        return schedule;
    };

    const schedule = generateSchedule();

    return (
        <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 backdrop-blur">
                <h4 className="text-white font-semibold mb-4">Your Week at a Glance</h4>
                <div className="space-y-3">
                    {schedule.map((block, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <div className={`w-2 h-12 rounded-full ${block.color}`} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-medium">{block.day}</span>
                                    <span className="text-white/60 text-sm">{block.time}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/80 text-sm">{block.activity}</span>
                                    <span className="text-white/60 text-xs">{block.duration} min</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl p-4 border border-orange-500/30">
                <p className="text-white/90 text-sm">
                    <span className="font-semibold">Smart Scheduling:</span> Ria has analyzed your calendar
                    and placed these activities in your free time slots to maximize consistency and minimize
                    conflicts.
                </p>
            </div>
        </div>
    );
}
