import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Smile, TrendingUp, Brain, Heart, Shield } from "lucide-react";
import {
    initializeFaceDetector,
    detectFace,
    analyzeMood,
    smilingBenefits,
    type MoodType,
    type MoodResult
} from "@/lib/faceDetection";

export default function MoodDetector() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [moodHistory, setMoodHistory] = useState<{ time: string; mood: MoodType }[]>([]);

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        // Initialize face detector
        initializeFaceDetector().then(() => {
            console.log('✅ Face detector initialized successfully');
            setIsModelLoaded(true);
        }).catch(error => {
            console.error('❌ Failed to initialize face detector:', error);
        });

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Auto-start analysis when model is loaded and camera is ready
    useEffect(() => {
        if (isModelLoaded && !isAnalyzing && cameraPermission === 'granted') {
            console.log('🎬 Auto-starting mood analysis...');
            startAnalysis();
        }
    }, [isModelLoaded, cameraPermission]);

    const handleCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setCameraPermission('granted');
        } catch (error) {
            setCameraPermission('denied');
        }
    };

    const analyzeFrame = async () => {
        const videoElement = webcamRef.current?.video;

        if (!videoElement || !canvasRef.current || !isAnalyzing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Detect face
        const timestamp = performance.now();
        const result = await detectFace(videoElement, timestamp);

        if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
            const landmarks = result.faceLandmarks[0];
            const blendshapes = result.faceBlendshapes;

            // Draw face mesh
            ctx.fillStyle = '#3b82f6'; // Bright blue
            landmarks.forEach((landmark: any) => {
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    2, // Slightly larger for visibility
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });

            // Analyze mood
            const mood = analyzeMood(landmarks, blendshapes);
            setMoodResult(mood);

            // Update mood history every 5 seconds
            const now = new Date();
            const currentTime = now.toLocaleTimeString();
            setMoodHistory(prev => {
                const lastEntry = prev[prev.length - 1];
                if (!lastEntry || lastEntry.time !== currentTime) {
                    return [...prev.slice(-9), { time: currentTime, mood: mood.mood }];
                }
                return prev;
            });
        }

        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    const startAnalysis = () => {
        setIsAnalyzing(true);
        setMoodHistory([]);
        analyzeFrame();
    };

    const stopAnalysis = () => {
        setIsAnalyzing(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const getMoodEmoji = (mood: MoodType) => {
        switch (mood) {
            case 'Happy': return '😊';
            case 'Neutral': return '😐';
            case 'Sad': return '😢';
            case 'Stressed': return '😰';
            default: return '🤔';
        }
    };

    const getMoodColor = (mood: MoodType) => {
        switch (mood) {
            case 'Happy': return 'from-green-400 to-emerald-500';
            case 'Neutral': return 'from-blue-400 to-cyan-500';
            case 'Sad': return 'from-gray-400 to-slate-500';
            case 'Stressed': return 'from-orange-400 to-red-500';
            default: return 'from-purple-400 to-indigo-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        AI Mood Detector
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Analyze your emotions through facial expressions and discover the power of smiling
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Camera Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="relative aspect-video bg-gray-900">
                                {cameraPermission === 'granted' ? (
                                    <>
                                        <Webcam
                                            ref={webcamRef}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            videoConstraints={{ facingMode: 'user' }}
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            className="absolute inset-0 w-full h-full"
                                        />

                                        {/* Current Mood Indicator */}
                                        <AnimatePresence>
                                            {moodResult && isAnalyzing && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="absolute top-4 left-1/2 -translate-x-1/2"
                                                >
                                                    <div className={`bg-gradient-to-r ${getMoodColor(moodResult.mood)} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3`}>
                                                        <span className="text-3xl">{getMoodEmoji(moodResult.mood)}</span>
                                                        <div>
                                                            <div className="font-bold text-lg">{moodResult.mood}</div>
                                                            <div className="text-xs opacity-90">
                                                                {moodResult.isSmiling ? '✓ Smiling' : 'Not smiling'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                Camera Access Required
                                            </h3>
                                            <p className="text-gray-400 mb-6 max-w-sm">
                                                We need access to your camera to analyze your facial expressions
                                            </p>
                                            <button
                                                onClick={handleCameraPermission}
                                                className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
                                            >
                                                Enable Camera
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Model Loading Indicator */}
                                {!isModelLoaded && (
                                    <div className="absolute top-4 left-4 bg-yellow-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                        Loading AI Model...
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                                <div className="flex justify-center">
                                    <button
                                        onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                                        disabled={!isModelLoaded || cameraPermission !== 'granted'}
                                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg ${isAnalyzing
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <Smile size={24} />
                                        {isAnalyzing ? 'Stop Analysis' : 'Start Mood Analysis'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Encouragement Message */}
                        <AnimatePresence mode="wait">
                            {moodResult && isAnalyzing && (
                                <motion.div
                                    key={moodResult.encouragement}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`bg-gradient-to-r ${getMoodColor(moodResult.mood)} text-white rounded-2xl p-6 shadow-xl`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl">{getMoodEmoji(moodResult.mood)}</div>
                                        <div className="flex-1">
                                            <p className="text-lg font-semibold">{moodResult.encouragement}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Side Panel */}
                    <div className="space-y-6">
                        {/* Mood History */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-6"
                        >
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="text-purple-600" size={20} />
                                Mood Timeline
                            </h3>
                            {moodHistory.length > 0 ? (
                                <div className="space-y-2">
                                    {moodHistory.map((entry, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-gray-600">{entry.time}</span>
                                            <span className="flex items-center gap-2">
                                                <span>{getMoodEmoji(entry.mood)}</span>
                                                <span className="font-medium">{entry.mood}</span>
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm text-center py-4">
                                    Start analysis to see your mood timeline
                                </p>
                            )}
                        </motion.div>

                        {/* Science Behind Smiling */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200"
                        >
                            <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <Brain className="text-purple-600" size={20} />
                                Why Smiling Works
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Even forced smiling triggers your brain to release feel-good chemicals. Here's how:
                            </p>
                            <div className="space-y-3">
                                {smilingBenefits.slice(0, 3).map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className="bg-white rounded-lg p-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{benefit.icon}</span>
                                            <div>
                                                <h4 className="font-semibold text-sm text-gray-800">{benefit.title}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{benefit.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* More Benefits */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl p-6"
                        >
                            <h3 className="font-semibold mb-4 text-gray-800">Additional Benefits</h3>
                            <div className="space-y-3">
                                {smilingBenefits.slice(3).map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm">
                                        <span className="text-xl">{benefit.icon}</span>
                                        <div>
                                            <div className="font-medium text-gray-800">{benefit.title}</div>
                                            <div className="text-xs text-gray-600">{benefit.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Tip */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-6"
                        >
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <Heart size={20} />
                                Daily Challenge
                            </h3>
                            <p className="text-sm">
                                Try smiling for 60 seconds right now, even if you don't feel like it. Notice how your mood shifts!
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
