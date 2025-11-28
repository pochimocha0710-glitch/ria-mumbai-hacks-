import { motion } from "framer-motion";
import { Camera, Smile, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { GridPattern } from "@/components/ui/GridPattern";

export default function AIFeaturesPreview() {
    return (
        <section className="relative py-16 md:py-20 bg-zinc-950">
            <GridPattern />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Try Our AI-Powered Features
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Experience cutting-edge AI technology for your wellness journey
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Posture Check Card */}
                    <Link href="/dashboard">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative bg-orange-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl overflow-hidden cursor-pointer"
                        >
                            {/* Textured background */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }} />
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex p-4 bg-white/20 backdrop-blur rounded-2xl mb-6">
                                    <Camera className="w-12 h-12" />
                                </div>

                                <h3 className="text-3xl font-bold mb-4">Posture & Form Check</h3>
                                <p className="text-orange-100 text-lg mb-6">
                                    Get real-time AI analysis of your exercise form. Perfect your push-ups, squats, and more with instant feedback.
                                </p>

                                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all">
                                    Try it now
                                    <ArrowRight className="w-5 h-5" />
                                </div>

                                {/* Feature Highlights */}
                                <div className="mt-8 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-orange-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Live camera detection
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-orange-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Real-time posture corrections
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-orange-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Automatic analysis
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Mood Detector Card */}
                    <Link href="/dashboard">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative bg-orange-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl overflow-hidden cursor-pointer"
                        >
                            {/* Textured background */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }} />
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex p-4 bg-white/20 backdrop-blur rounded-2xl mb-6">
                                    <Smile className="w-12 h-12" />
                                </div>

                                <h3 className="text-3xl font-bold mb-4">AI Mood Detector</h3>
                                <p className="text-orange-100 text-lg mb-6">
                                    Analyze your emotions through facial expressions and discover the science-backed power of smiling.
                                </p>

                                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all">
                                    Try it now
                                    <ArrowRight className="w-5 h-5" />
                                </div>

                                {/* Feature Highlights */}
                                <div className="mt-8 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-orange-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Real-time emotion detection
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-orange-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Automatic mood tracking
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-orange-100">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Historical data saved
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Privacy Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-zinc-500">
                        All AI processing happens locally in your browser. Your video never leaves your device.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
