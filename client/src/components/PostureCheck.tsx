import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Play, Pause, AlertCircle } from "lucide-react";
import {
    initializePoseDetector,
    detectPose,
    generateFeedback,
    DrawingUtils,
    type ExerciseFeedback
} from "@/lib/poseDetection";

type ExerciseType = 'push-up' | 'sit-up' | 'squat' | 'plank';
type InputMode = 'camera' | 'upload';

export default function PostureCheck() {
    const [inputMode, setInputMode] = useState<InputMode>('camera');
    const [exerciseType, setExerciseType] = useState<ExerciseType>('push-up');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
    const [repCount, setRepCount] = useState(0);
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationFrameRef = useRef<number>();
    const lastPositionRef = useRef<'up' | 'down'>('up');

    useEffect(() => {
        // Initialize pose detector
        initializePoseDetector().then(() => {
            console.log('✅ Pose detector initialized successfully');
            setIsModelLoaded(true);
        }).catch(error => {
            console.error('❌ Failed to initialize pose detector:', error);
        });

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Auto-start analysis when model is loaded and camera is ready
    useEffect(() => {
        if (isModelLoaded && !isAnalyzing && inputMode === 'camera' && cameraPermission === 'granted') {
            console.log('🎬 Auto-starting posture analysis...');
            startAnalysis();
        }
    }, [isModelLoaded, cameraPermission, inputMode]);

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
        const videoElement = inputMode === 'camera'
            ? webcamRef.current?.video
            : videoRef.current;

        if (!videoElement || !canvasRef.current || !isAnalyzing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Draw video frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Detect pose
        const timestamp = performance.now();
        const result = await detectPose(videoElement, timestamp);

        if (result && result.landmarks && result.landmarks.length > 0) {
            const landmarks = result.landmarks[0];

            // Draw pose landmarks
            const drawingUtils = new DrawingUtils(ctx);

            // Draw connections
            const connections = [
                [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
                [11, 23], [12, 24], [23, 24], // Torso
                [23, 25], [25, 27], [24, 26], [26, 28], // Legs
            ];

            connections.forEach(([start, end]) => {
                const startPoint = landmarks[start];
                const endPoint = landmarks[end];

                ctx.beginPath();
                ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
                ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
                ctx.strokeStyle = '#00FF00'; // Bright neon green
                ctx.lineWidth = 6; // Much thicker for visibility
                ctx.stroke();
            });

            // Draw landmarks
            landmarks.forEach((landmark: any) => {
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    8, // Larger points
                    0,
                    2 * Math.PI
                );
                ctx.fillStyle = '#00FF00'; // Bright green to match skeleton
                ctx.fill();
            });

            // Analyze form
            const analysis = generateFeedback(landmarks, exerciseType);
            setFeedback(analysis);

            // Count reps based on position changes
            if (exerciseType === 'push-up' || exerciseType === 'squat') {
                const leftElbow = landmarks[13];
                const leftShoulder = landmarks[11];
                const isDown = Math.abs(leftElbow.y - leftShoulder.y) < 0.1;

                if (isDown && lastPositionRef.current === 'up' && analysis.isGoodForm) {
                    setRepCount(prev => prev + 1);
                    lastPositionRef.current = 'down';
                } else if (!isDown && lastPositionRef.current === 'down') {
                    lastPositionRef.current = 'up';
                }
            }
        }

        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    const startAnalysis = () => {
        setIsAnalyzing(true);
        setRepCount(0);
        lastPositionRef.current = 'up';
        analyzeFrame();
    };

    const stopAnalysis = () => {
        setIsAnalyzing(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && videoRef.current) {
            const url = URL.createObjectURL(file);
            videoRef.current.src = url;
            videoRef.current.load();
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
                        AI Posture & Form Check
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Get real-time feedback on your exercise form to prevent injuries and maximize effectiveness
                    </p>
                </motion.div>

                {/* Mode Selection */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setInputMode('camera')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${inputMode === 'camera'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'glass-card text-white hover:bg-white/20'
                            }`}
                    >
                        <Camera size={20} />
                        Live Camera
                    </button>
                    <button
                        onClick={() => setInputMode('upload')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${inputMode === 'upload'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'glass-card text-white hover:bg-white/20'
                            }`}
                    >
                        <Upload size={20} />
                        Upload Video
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Video Feed */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="relative aspect-video bg-gray-900">
                                {inputMode === 'camera' ? (
                                    cameraPermission === 'granted' ? (
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
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    Camera Access Required
                                                </h3>
                                                <p className="text-gray-400 mb-6 max-w-sm">
                                                    We need access to your camera to analyze your exercise form
                                                </p>
                                                <button
                                                    onClick={handleCameraPermission}
                                                    className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
                                                >
                                                    Enable Camera
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="absolute inset-0">
                                        {videoRef.current?.src ? (
                                            <>
                                                <video
                                                    ref={videoRef}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    controls
                                                />
                                                <canvas
                                                    ref={canvasRef}
                                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                                />
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <label className="cursor-pointer text-center">
                                                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                    <span className="text-white text-lg font-semibold">
                                                        Click to upload video
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={handleVideoUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        )}
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
                            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Exercise Type
                                        </label>
                                        <select
                                            value={exerciseType}
                                            onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
                                            className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            disabled={isAnalyzing}
                                        >
                                            <option value="push-up">Push-ups</option>
                                            <option value="sit-up">Sit-ups</option>
                                            <option value="squat">Squats</option>
                                            <option value="plank">Plank</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                                        disabled={!isModelLoaded || (inputMode === 'camera' && cameraPermission !== 'granted')}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${isAnalyzing
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Pause size={20} />
                                                Stop Analysis
                                            </>
                                        ) : (
                                            <>
                                                <Play size={20} />
                                                Start Analysis
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feedback Panel */}
                    <div className="space-y-6">
                        {/* Rep Counter */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
                        >
                            <h3 className="text-lg font-semibold mb-2">Rep Count</h3>
                            <div className="text-6xl font-bold">{repCount}</div>
                        </motion.div>

                        {/* Form Quality */}
                        <AnimatePresence mode="wait">
                            {feedback && (
                                <motion.div
                                    key="feedback"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-2xl shadow-xl p-6"
                                >
                                    <h3 className="text-lg font-semibold mb-4">Form Quality</h3>

                                    {/* Score Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-600">Score</span>
                                            <span className="text-2xl font-bold text-indigo-600">{feedback.score}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${feedback.score}%` }}
                                                className={`h-full rounded-full ${feedback.score >= 80
                                                    ? 'bg-green-500'
                                                    : feedback.score >= 60
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Corrections */}
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            {feedback.isGoodForm ? (
                                                <span className="text-green-600">✓ Great Form!</span>
                                            ) : (
                                                <>
                                                    <AlertCircle className="text-orange-500" size={20} />
                                                    <span className="text-gray-700">Corrections Needed</span>
                                                </>
                                            )}
                                        </h4>
                                        {feedback.corrections.length > 0 ? (
                                            <ul className="space-y-2">
                                                {feedback.corrections.map((correction, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-start gap-2 text-sm text-gray-600"
                                                    >
                                                        <span className="text-orange-500 mt-0.5">•</span>
                                                        <span>{correction}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-green-600">
                                                Perfect form! Keep it up! 💪
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tips */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200"
                        >
                            <h3 className="font-semibold mb-3 text-gray-800">💡 Pro Tips</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Position yourself so your full body is visible</li>
                                <li>• Ensure good lighting for better detection</li>
                                <li>• Perform exercises slowly for accurate analysis</li>
                                <li>• Maintain good form over speed</li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
