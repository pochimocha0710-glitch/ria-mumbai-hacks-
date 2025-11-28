import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, ArrowRight, Zap, X, User, Heart, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveJourneyData, saveRoutine, db } from "@/lib/firebase.config";
import { doc, setDoc } from "firebase/firestore";
import { BentoCard } from "@/components/ui/BentoCard";
import { PillButton } from "@/components/ui/PillButton";
import { GridPattern } from "@/components/ui/GridPattern";

interface JourneyWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserProfile {
    height: string;
    weight: string;
    age: string;
    location: string;
}

interface HealthInfo {
    postureIssues: string[];
    diseases: string[];
    conditions: string[];
}

export default function JourneyWizard({ isOpen, onClose }: JourneyWizardProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [calendarConnected, setCalendarConnected] = useState(false);

    // Form data
    const [userProfile, setUserProfile] = useState<UserProfile>({
        height: "",
        weight: "",
        age: "",
        location: ""
    });
    const [healthInfo, setHealthInfo] = useState<HealthInfo>({
        postureIssues: [],
        diseases: [],
        conditions: []
    });
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    const totalSteps = 6;

    const nextStep = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(s => s + 1);
        }, 800);
    };

    const prevStep = () => {
        setStep(s => Math.max(1, s - 1));
    };

    const handleGoalToggle = (goal: string) => {
        setSelectedGoals(prev =>
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    };

    const handleHealthToggle = (category: keyof HealthInfo, item: string) => {
        setHealthInfo(prev => ({
            ...prev,
            [category]: prev[category].includes(item)
                ? prev[category].filter(i => i !== item)
                : [...prev[category], item]
        }));
    };

    const handleComplete = async () => {
        if (!user) {
            alert('Please sign in to save your wellness plan');
            return;
        }

        setLoading(true);
        try {
            const journeyData = {
                userProfile,
                healthInfo,
                goals: selectedGoals,
                calendarConnected,
                completedAt: new Date(),
            };
            await saveJourneyData(user.uid, journeyData);
            
            // Update user profile with health info for task generation
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                age: userProfile.age,
                height: userProfile.height,
                weight: userProfile.weight,
                healthIssues: [
                    ...healthInfo.postureIssues.filter(i => i !== 'None'),
                    ...healthInfo.diseases.filter(i => i !== 'None'),
                    ...healthInfo.conditions.filter(i => i !== 'None')
                ],
                mentalHealth: healthInfo.conditions.filter(c => ['Anxiety', 'Depression'].includes(c)),
                onboardingCompleted: true,
            }, { merge: true });

            // Automatically generate weekly tasks based on disease/problem
            try {
                const response = await fetch('/api/planner/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.uid,
                        preferences: `Goals: ${selectedGoals.join(', ')}. Health Issues: ${[
                            ...healthInfo.postureIssues.filter(i => i !== 'None'),
                            ...healthInfo.diseases.filter(i => i !== 'None'),
                            ...healthInfo.conditions.filter(i => i !== 'None')
                        ].join(', ')}`
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Weekly tasks generated:', data.tasksCreated);
                }
            } catch (error) {
                console.error('Error generating tasks:', error);
                // Don't fail the journey completion if task generation fails
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Connect Your\nCalendar";
            case 2: return "Tell Us\nAbout You";
            case 3: return "Health\nAssessment";
            case 4: return "Your\nGoals";
            case 5: return "AI-Generated\nRoutine";
            case 6: return "Schedule\nReview";
            default: return "";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "Sync your Google Calendar to find the perfect time slots for your wellness activities.";
            case 2: return "Share some basic information to help us personalize your experience.";
            case 3: return "Help us understand your current health status and any concerns.";
            case 4: return "What areas of your life would you like to improve?";
            case 5: return "Review your AI-generated personalized wellness routine.";
            case 6: return "Confirm your schedule and add activities to your calendar.";
            default: return "";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
            <GridPattern />

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Left Side: Context */}
                <BentoCard className="p-12 flex flex-col justify-between min-h-[600px]" hoverEffect={false}>
                    <div>
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                            <span className="font-bold text-xl text-white">{step}</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight whitespace-pre-line">
                            {getStepTitle()}
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            {getStepDescription()}
                        </p>
                    </div>

                    <div className="flex gap-2 mt-8">
                        {[...Array(totalSteps)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 <= step ? 'w-12 bg-orange-500' : 'w-4 bg-zinc-800'
                                    }`}
                            />
                        ))}
                    </div>
                </BentoCard>

                {/* Right Side: Action */}
                <BentoCard className="p-12 flex flex-col justify-center relative overflow-y-auto max-h-[600px]" hoverEffect={false}>
                    <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white z-10">
                        <X className="w-6 h-6" />
                    </button>

                    {/* Step 1: Calendar Connection */}
                    {step === 1 && (
                        <div className="space-y-6 text-center w-full">
                            <div className="mx-auto w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center relative">
                                <Calendar className="w-10 h-10 text-white" />
                                {calendarConnected && (
                                    <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-zinc-900" />
                                )}
                            </div>
                            <PillButton
                                onClick={() => {
                                    if (!user) {
                                        alert("Please sign in to connect your calendar.");
                                        return;
                                    }
                                    setCalendarConnected(true);
                                    nextStep();
                                }}
                                variant="primary"
                                className="w-full justify-center"
                                icon={ArrowRight}
                            >
                                {loading ? "Connecting..." : "Connect Google Calendar"}
                            </PillButton>
                            <button onClick={nextStep} className="text-sm text-zinc-500 hover:text-white transition-colors">
                                Skip for now
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personal Information */}
                    {step === 2 && (
                        <div className="space-y-4 w-full">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Height (cm)</label>
                                <input
                                    type="number"
                                    value={userProfile.height}
                                    onChange={(e) => setUserProfile({ ...userProfile, height: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="170"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={userProfile.weight}
                                    onChange={(e) => setUserProfile({ ...userProfile, weight: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="70"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Age</label>
                                <input
                                    type="number"
                                    value={userProfile.age}
                                    onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="25"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white">Location</label>
                                <input
                                    type="text"
                                    value={userProfile.location}
                                    onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="New York, USA"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={prevStep} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                                    Back
                                </button>
                                <PillButton onClick={nextStep} variant="primary" className="flex-1 justify-center" icon={ArrowRight}>
                                    Continue
                                </PillButton>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Health Assessment */}
                    {step === 3 && (
                        <div className="space-y-4 w-full">
                            <div>
                                <h3 className="text-white font-semibold mb-3">Posture Issues</h3>
                                <div className="space-y-2">
                                    {['Forward Head', 'Rounded Shoulders', 'Lower Back Pain', 'None'].map(issue => (
                                        <button
                                            key={issue}
                                            onClick={() => handleHealthToggle('postureIssues', issue)}
                                            className={`w-full p-3 text-left rounded-xl border transition-all ${healthInfo.postureIssues.includes(issue)
                                                    ? 'bg-orange-500/20 text-white border-orange-500'
                                                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                                }`}
                                        >
                                            {issue}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-3">Diseases & Health Conditions</h3>
                                <div className="space-y-2">
                                    {['Diabetes', 'Hypertension', 'Asthma', 'Back/Posture Problems', 'Anxiety/Stress', 'Depression/Mood Issues', 'Sleep Issues', 'None'].map(condition => (
                                        <button
                                            key={condition}
                                            onClick={() => handleHealthToggle('conditions', condition)}
                                            className={`w-full p-3 text-left rounded-xl border transition-all ${healthInfo.conditions.includes(condition)
                                                    ? 'bg-orange-500/20 text-white border-orange-500'
                                                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                                }`}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-3">Diseases</h3>
                                <div className="space-y-2">
                                    {['Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Heart Disease', 'None'].map(disease => (
                                        <button
                                            key={disease}
                                            onClick={() => handleHealthToggle('diseases', disease)}
                                            className={`w-full p-3 text-left rounded-xl border transition-all ${healthInfo.diseases.includes(disease)
                                                    ? 'bg-orange-500/20 text-white border-orange-500'
                                                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                                }`}
                                        >
                                            {disease}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={prevStep} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                                    Back
                                </button>
                                <PillButton onClick={nextStep} variant="primary" className="flex-1 justify-center" icon={ArrowRight}>
                                    Continue
                                </PillButton>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Goals */}
                    {step === 4 && (
                        <div className="w-full space-y-3">
                            {['Better Posture', 'Mental Clarity', 'Gym Consistency', 'Deep Sleep', 'Stress Management', 'Healthy Eating'].map(goal => (
                                <button
                                    key={goal}
                                    onClick={() => handleGoalToggle(goal)}
                                    className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between ${selectedGoals.includes(goal)
                                            ? 'bg-orange-500/20 text-white border-orange-500'
                                            : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                        }`}
                                >
                                    {goal}
                                    <div className={`w-5 h-5 rounded-full border ${selectedGoals.includes(goal) ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
                                        }`} />
                                </button>
                            ))}
                            <div className="flex gap-3 pt-4">
                                <button onClick={prevStep} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                                    Back
                                </button>
                                <PillButton onClick={nextStep} variant="accent" className="flex-1 justify-center" icon={Zap}>
                                    {loading ? "Generating..." : "Generate Plan"}
                                </PillButton>
                            </div>
                        </div>
                    )}

                    {/* Step 5: AI-Generated Routine */}
                    {step === 5 && (
                        <div className="w-full space-y-4">
                            <div className="space-y-3">
                                {[
                                    { time: '07:00', activity: 'Morning Stretch', duration: '15 min', type: 'Posture' },
                                    { time: '12:30', activity: 'Mindfulness Break', duration: '10 min', type: 'Mental' },
                                    { time: '18:00', activity: 'Gym Workout', duration: '45 min', type: 'Fitness' },
                                    { time: '22:00', activity: 'Sleep Routine', duration: '30 min', type: 'Recovery' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                        <span className="font-mono text-orange-500 font-bold">{item.time}</span>
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{item.activity}</div>
                                            <div className="text-xs text-zinc-500 uppercase">{item.type} · {item.duration}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={prevStep} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                                    Back
                                </button>
                                <PillButton onClick={nextStep} variant="primary" className="flex-1 justify-center" icon={ArrowRight}>
                                    Continue
                                </PillButton>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Schedule Review & Confirmation */}
                    {step === 6 && (
                        <div className="w-full space-y-4">
                            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                                <h3 className="text-white font-semibold mb-2">Ready to Start!</h3>
                                <p className="text-zinc-400 text-sm">
                                    Your personalized wellness routine has been created based on your goals and health profile.
                                    {calendarConnected && " Activities will be added to your Google Calendar."}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={prevStep} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                                    Back
                                </button>
                                <PillButton onClick={handleComplete} variant="primary" className="flex-1 justify-center" icon={CheckCircle}>
                                    {loading ? "Saving..." : "Start My Journey"}
                                </PillButton>
                            </div>
                        </div>
                    )}
                </BentoCard>
            </div>
        </div>
    );
}
