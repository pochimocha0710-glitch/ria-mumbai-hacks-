import { motion } from "framer-motion";
import { Camera, Smile, MessageCircle, Calendar, CheckCircle, ArrowRight } from "lucide-react";

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-zinc-950 py-12 px-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-zinc-950 to-black"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        How Ria Works
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Your complete guide to transforming your life with Ria's AI-powered wellness platform
                    </p>
                </motion.div>

                {/* Getting Started */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-zinc-800"
                >
                    <h2 className="text-3xl font-bold mb-8 text-white">Getting Started</h2>
                    <div className="space-y-8">
                        {[
                            {
                                step: 1,
                                title: "Create Your Account",
                                description: "Sign up with your email or phone number. Tell Ria about your goals, current habits, and what you want to change.",
                                icon: CheckCircle
                            },
                            {
                                step: 2,
                                title: "Choose Your Challenge",
                                description: "Select a 30-day challenge: quit smoking, reduce alcohol, avoid junk food, build exercise habits, or improve mental wellness.",
                                icon: Calendar
                            },
                            {
                                step: 3,
                                title: "Meet Your AI Coach",
                                description: "Ria will create a personalized plan and start chatting with you daily. She speaks your language and understands your struggles.",
                                icon: MessageCircle
                            },
                            {
                                step: 4,
                                title: "Start Your Journey",
                                description: "Complete daily tasks, track your progress, and watch your transformation unfold over 30 days.",
                                icon: ArrowRight
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                                className="flex gap-6"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg shadow-orange-500/50">
                                        {item.step}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
                                        <item.icon className="w-5 h-5 text-orange-400" />
                                        {item.title}
                                    </h3>
                                    <p className="text-white/80">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Feature Guides */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Posture Check */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30"
                    >
                        <div className="bg-orange-500 text-white rounded-xl p-4 inline-flex mb-4">
                            <Camera className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-white">Using Posture Check</h3>
                        <ol className="space-y-3 text-white/80">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-orange-500">1.</span>
                                <span>Navigate to the Posture Check feature</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-indigo-600">2.</span>
                                <span>Allow camera access when prompted</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-indigo-600">3.</span>
                                <span>Select your exercise type (push-ups, squats, etc.)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-indigo-600">4.</span>
                                <span>Position yourself so your full body is visible</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-indigo-600">5.</span>
                                <span>Click "Start Analysis" and perform your exercise</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-indigo-600">6.</span>
                                <span>Watch real-time feedback and corrections appear</span>
                            </li>
                        </ol>
                        <div className="mt-6 p-4 bg-white rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>💡 Pro Tip:</strong> Ensure good lighting and a clear background for best results. The AI works best when it can clearly see your body position.
                            </p>
                        </div>
                    </motion.div>

                    {/* Mood Detector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30"
                    >
                        <div className="bg-orange-500 text-white rounded-xl p-4 inline-flex mb-4">
                            <Smile className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-white">Using Mood Detector</h3>
                        <ol className="space-y-3 text-white/80">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-orange-500">1.</span>
                                <span>Go to the Mood Detector page</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-purple-600">2.</span>
                                <span>Grant camera permission</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-purple-600">3.</span>
                                <span>Click "Start Mood Analysis"</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-purple-600">4.</span>
                                <span>Look at the camera naturally</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-purple-600">5.</span>
                                <span>Ria will detect your current mood</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-purple-600">6.</span>
                                <span>Follow the encouragement to smile and improve your mood!</span>
                            </li>
                        </ol>
                        <div className="mt-6 p-4 bg-white rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>🧠 Science Fact:</strong> Even forced smiling triggers endorphin release. Try smiling for 60 seconds and feel the difference!
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl shadow-xl p-8 md:p-12 border border-zinc-800"
                >
                    <h2 className="text-3xl font-bold mb-8 text-white">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: "Is my camera data stored or shared?",
                                a: "No! All AI processing happens locally in your browser. Your video never leaves your device. We prioritize your privacy."
                            },
                            {
                                q: "Do I need any special equipment?",
                                a: "Just a device with a camera (phone, tablet, or computer). No special equipment needed!"
                            },
                            {
                                q: "How accurate is the posture detection?",
                                a: "Our AI uses Google's MediaPipe technology, which is highly accurate. It can detect 33 body landmarks in real-time with professional-grade precision."
                            },
                            {
                                q: "Can I use Ria in my regional language?",
                                a: "Yes! Ria supports multiple Indian languages including Hindi, Tamil, Telugu, Bengali, Marathi, and more."
                            },
                            {
                                q: "What if I miss a day in my 30-day challenge?",
                                a: "Don't worry! Ria understands that life happens. You can continue your challenge, though your streak will reset. The important thing is to keep going."
                            },
                            {
                                q: "Is Ria free to use?",
                                a: "Ria offers a free tier with basic features. Premium features include advanced AI coaching, detailed analytics, and personalized meal plans."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                className="border-b border-white/10 pb-6 last:border-0"
                            >
                                <h3 className="text-lg font-semibold mb-2 text-white">{faq.q}</h3>
                                <p className="text-white/70">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white shadow-lg shadow-orange-500/50"
                >
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Life?</h2>
                    <p className="text-xl mb-8 text-orange-100">
                        Join thousands of Indians who are building better habits with Ria
                    </p>
                    <a
                        href="/signin"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        Start Your Free 30-Day Challenge
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
