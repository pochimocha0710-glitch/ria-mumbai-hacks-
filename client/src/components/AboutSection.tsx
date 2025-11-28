import { motion } from "framer-motion";
import { MessageCircle, Calendar, Dumbbell, Apple, Heart, Camera, Smile, Trophy } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";

const features = [
    {
        icon: MessageCircle,
        title: "AI Wellness Chatbot",
        description: "Ria talks like a supportive coach, providing practical and emotional advice tailored to your journey.",
        details: "Get personalized guidance 24/7 in multiple Indian languages. Ria understands your struggles and motivates you like a friend."
    },
    {
        icon: Calendar,
        title: "30-Day Habit Challenges",
        description: "Transform your life in just 30 days with structured challenges to quit bad habits or build healthy ones.",
        details: "Daily tasks, streak tracking, and milestone celebrations keep you motivated throughout your transformation journey."
    },
    {
        icon: Dumbbell,
        title: "Natural Gym Guidance",
        description: "Learn the truth about steroids and get clean, effective workout plans for sustainable fitness.",
        details: "Educate yourself about the dangers of steroid misuse and build muscle naturally with science-backed training programs."
    },
    {
        icon: Apple,
        title: "Smart Nutrition Plans",
        description: "Customized Indian meal plans (veg/non-veg) designed for fat loss, weight gain, or balanced health.",
        details: "Get meal plans that fit your lifestyle, preferences, and goals. Real Indian food, not generic Western diets."
    },
    {
        icon: Heart,
        title: "Mental Wellness Tools",
        description: "Track your mood, practice breathing exercises, and receive daily affirmations for emotional balance.",
        details: "Comprehensive mental health support including meditation guides, stress management, and emotional check-ins."
    },
    {
        icon: Camera,
        title: "Posture Check System",
        description: "AI-powered analysis of your exercise form to prevent injuries and maximize workout effectiveness.",
        details: "Real-time feedback on push-ups, squats, sit-ups, and more. Get corrective guidance like having a personal trainer."
    },
    {
        icon: Smile,
        title: "Mood Detection",
        description: "Advanced facial recognition to detect your emotional state and encourage positive mental health.",
        details: "Uses the science of forced smiling to trigger endorphin release and improve your mood naturally."
    },
    {
        icon: Trophy,
        title: "Gamified Progress",
        description: "Compete on leaderboards, earn badges, and celebrate milestones with the Ria community.",
        details: "Stay motivated with achievements, streaks, and friendly competition. Your progress is visible and rewarding."
    }
];

export default function AboutSection() {
    return (
        <section className="relative py-20 px-4 bg-zinc-950">
            <GridPattern />
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        How Ria Works
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
                        Your AI-powered wellness companion that combines cutting-edge technology with emotional intelligence
                        to help you build better habits and transform your life naturally.
                    </p>
                </motion.div>

                {/* What Makes Ria Different */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-orange-500 rounded-3xl p-8 md:p-12 mb-16 text-white relative overflow-hidden"
                >
                    {/* Textured background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-6">What Makes Ria Different?</h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div>
                                <h4 className="text-xl font-semibold mb-2">Emotional Intelligence</h4>
                                <p className="text-orange-100">
                                    Unlike typical fitness apps, Ria understands the emotional side of discipline and habit formation.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold mb-2">Made for India</h4>
                                <p className="text-orange-100">
                                    Speaks multiple Indian languages, understands local food culture, and addresses India-specific health challenges.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold mb-2">Holistic Approach</h4>
                                <p className="text-orange-100">
                                    Combines physical fitness, nutrition, mental wellness, and habit formation in one comprehensive platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="group relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-orange-500 transition-all duration-300 overflow-hidden"
                        >
                            {/* Icon */}
                            <div className="inline-flex p-3 rounded-xl bg-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                {feature.description}
                            </p>

                            {/* Details (shown on hover) */}
                            <div className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-300">
                                <div className="pt-4 border-t border-zinc-800">
                                    <p className="text-xs text-zinc-500">
                                        {feature.details}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* How It Works Process */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <h3 className="text-3xl font-bold text-center mb-12 text-white">
                        Your Journey with Ria
                    </h3>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "1", title: "Sign Up", desc: "Create your profile and tell Ria about your goals" },
                            { step: "2", title: "Get Personalized Plan", desc: "Ria creates a custom 30-day challenge for you" },
                            { step: "3", title: "Daily Guidance", desc: "Complete daily tasks with Ria's support and motivation" },
                            { step: "4", title: "Transform", desc: "See real results in 30 days and build lasting habits" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="relative"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-orange-500 text-white text-2xl font-bold flex items-center justify-center mb-4 shadow-lg">
                                        {item.step}
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2 text-white">{item.title}</h4>
                                    <p className="text-zinc-400 text-sm">{item.desc}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-zinc-700" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <a
                        href="/signin"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-full font-semibold text-lg shadow-xl hover:bg-orange-600 hover:scale-105 transition-all duration-300"
                    >
                        Start Your Transformation
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
