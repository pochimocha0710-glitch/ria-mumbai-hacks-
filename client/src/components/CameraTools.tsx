import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Smile, Activity } from "lucide-react";
import {
    initializeFaceAPI,
    detectEmotion,
    type EmotionResult
} from "@/lib/lightweightFaceDetection";
import {
    initializeMoveNet,
    detectPose,
    analyzePosture,
    type PostureStatus
} from "@/lib/lightweightPoseDetection";
import * as poseDetection from '@tensorflow-models/pose-detection';

interface CameraToolsProps {
    activeTab: 'mood' | 'posture';
    setActiveTab: (tab: 'mood' | 'posture') => void;
}

interface HistoryEntry {
    time: string;
    label: string;
    type: 'mood' | 'posture';
    suggestion?: string;
}

export default function CameraTools({ activeTab, setActiveTab }: CameraToolsProps) {
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>("Not active");
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offscreenCanvasRef = useRef<OffscreenCanvas | null>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        // Initialize lightweight detectors
        let isMounted = true;
        
        // Load models with better error handling
        const loadModels = async () => {
            try {
                console.log('🔄 Starting model initialization...');
                
                // Load both models in parallel for faster startup
                const [poseDetector, faceLoaded] = await Promise.allSettled([
                    initializeMoveNet(),
                    initializeFaceAPI()
                ]);
                
                const poseSuccess = poseDetector.status === 'fulfilled' && poseDetector.value !== null;
                const faceSuccess = faceLoaded.status === 'fulfilled' && faceLoaded.value === true;
                
                if (isMounted) {
                    if (poseSuccess) {
                        setIsModelLoaded(true);
                        console.log('✅ Models ready - Posture:', true, 'Face:', faceSuccess);
                    } else {
                        console.error('❌ Failed to load posture detection');
                        setIsModelLoaded(false);
                    }
                }
            } catch (err) {
                console.error('Model loading error:', err);
                if (isMounted) {
                    setIsModelLoaded(false);
                }
            }
        };

        loadModels();

        return () => {
            isMounted = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const handleCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setCameraPermission('granted');
        } catch (error) {
            setCameraPermission('denied');
        }
    };

    const analyzeMoodFrame = async () => {
        const videoElement = webcamRef.current?.video;
        if (!videoElement || !canvasRef.current || !isAnalyzing || activeTab !== 'mood') {
            if (isAnalyzing && activeTab === 'mood') {
                animationFrameRef.current = requestAnimationFrame(analyzeMoodFrame);
            }
            return;
        }

        // Check if video is ready
        if (videoElement.readyState < videoElement.HAVE_ENOUGH_DATA) {
            animationFrameRef.current = requestAnimationFrame(analyzeMoodFrame);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(analyzeMoodFrame);
            return;
        }

        // Only resize canvas if dimensions changed
        if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
        }

        try {
            // Ensure face-api is initialized
            await initializeFaceAPI();
            
            // Use lightweight face-api.js for emotion detection
            const emotionResult = await detectEmotion(videoElement);

            if (emotionResult) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw simple face detection box (optional visual feedback)
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.strokeRect(50, 50, 200, 200); // Placeholder - face-api doesn't return bounding box in this version

                // Create detailed mood status with suggestions
                const statusText = `${emotionResult.expression} (${Math.round(emotionResult.probability * 100)}%)`;
                setCurrentStatus(statusText);

                // Update history with mood suggestions (throttled to once per second)
                const now = new Date();
                const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                let moodSuggestion = '';
                if (emotionResult.expression === 'Sad' || emotionResult.expression === 'Stressed') {
                    moodSuggestion = '💡 Take a deep breath, try a quick stretch';
                } else if (emotionResult.expression === 'Happy') {
                    moodSuggestion = '😊 Great mood! Keep it up!';
                } else {
                    moodSuggestion = '😐 Neutral mood detected';
                }
                
                setHistory(prev => {
                    const lastEntry = prev[prev.length - 1];
                    // Only update if mood changed or 1 second passed
                    if (!lastEntry || lastEntry.time !== currentTime || lastEntry.label !== emotionResult.expression) {
                        return [...prev.slice(-19), { time: currentTime, label: emotionResult.expression, type: 'mood', suggestion: moodSuggestion }];
                    }
                    return prev;
                });
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setCurrentStatus('No face detected');
            }

            animationFrameRef.current = requestAnimationFrame(analyzeMoodFrame);
        } catch (error) {
            console.error('Error in mood detection:', error);
            setCurrentStatus('Detection error');
            animationFrameRef.current = requestAnimationFrame(analyzeMoodFrame);
        }
    };

    const analyzePostureFrame = async () => {
        const videoElement = webcamRef.current?.video;
        if (!videoElement || !canvasRef.current || !isAnalyzing || activeTab !== 'posture') {
            if (isAnalyzing && activeTab === 'posture') {
                animationFrameRef.current = requestAnimationFrame(analyzePostureFrame);
            }
            return;
        }

        // Check if video is ready
        if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
            animationFrameRef.current = requestAnimationFrame(analyzePostureFrame);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(analyzePostureFrame);
            return;
        }

        // Only resize canvas if dimensions changed
        if (canvas.width !== videoElement.videoWidth || canvas.height !== videoElement.videoHeight) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
        }

        try {
            // Ensure MoveNet is initialized
            await initializeMoveNet();
            
            // Use lightweight MoveNet for pose detection
            const poses = await detectPose(videoElement);

            if (poses && poses.length > 0) {
                const pose = poses[0];
                const keypoints = pose.keypoints;

                // Analyze posture first to determine colors
                const postureStatus = analyzePosture(poses);
                const isGoodPosture = postureStatus.status === 'good' && postureStatus.issues.length === 0;

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Define skeleton connections with their importance for posture
                const connections: Array<{
                    start: string;
                    end: string;
                    isPostureCritical: boolean; // If this connection affects posture
                }> = [
                    { start: 'left_shoulder', end: 'right_shoulder', isPostureCritical: true }, // Shoulder alignment
                    { start: 'left_shoulder', end: 'left_elbow', isPostureCritical: false },
                    { start: 'left_elbow', end: 'left_wrist', isPostureCritical: false },
                    { start: 'right_shoulder', end: 'right_elbow', isPostureCritical: false },
                    { start: 'right_elbow', end: 'right_wrist', isPostureCritical: false },
                    { start: 'left_shoulder', end: 'left_hip', isPostureCritical: true }, // Torso alignment
                    { start: 'right_shoulder', end: 'right_hip', isPostureCritical: true }, // Torso alignment
                    { start: 'left_hip', end: 'right_hip', isPostureCritical: true }, // Hip alignment
                    { start: 'left_hip', end: 'left_knee', isPostureCritical: false },
                    { start: 'left_knee', end: 'left_ankle', isPostureCritical: false },
                    { start: 'right_hip', end: 'right_knee', isPostureCritical: false },
                    { start: 'right_knee', end: 'right_ankle', isPostureCritical: false }
                ];

                // Draw connections with GREEN lines for visibility (as requested)
                connections.forEach(({ start, end, isPostureCritical }) => {
                    const startKp = keypoints.find(kp => kp.name === start);
                    const endKp = keypoints.find(kp => kp.name === end);
                    
                    if (startKp && endKp && (startKp.score ?? 0) > 0.3 && (endKp.score ?? 0) > 0.3) {
                        // Always use bright green for skeleton visibility
                        ctx.strokeStyle = '#00FF00'; // Bright green
                        ctx.lineWidth = isPostureCritical ? 5 : 3; // Thicker for critical connections
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        
                        ctx.beginPath();
                        ctx.moveTo(startKp.x, startKp.y);
                        ctx.lineTo(endKp.x, endKp.y);
                        ctx.stroke();
                    }
                });

                // Draw keypoints with bright green for visibility
                keypoints.forEach(kp => {
                    if ((kp.score ?? 0) > 0.3) {
                        // All keypoints in bright green for clear visibility
                        ctx.fillStyle = '#00FF00'; // Bright green
                        ctx.strokeStyle = '#00AA00'; // Darker green outline
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        const radius = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'nose'].includes(kp.name || '') ? 8 : 6;
                        ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.stroke();
                    }
                });

                // Draw correction guides (red lines showing what's wrong)
                if (!isGoodPosture) {
                    const nose = keypoints.find(kp => kp.name === 'nose');
                    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
                    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
                    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
                    const rightHip = keypoints.find(kp => kp.name === 'right_hip');

                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]); // Dashed line for correction guides

                    // Draw correction guides based on issues
                    if (postureStatus.issues.some(i => i.includes('Slouching'))) {
                        // Show ideal spine line
                        if (leftShoulder && rightShoulder && leftHip && rightHip) {
                            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
                            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
                            const hipMidX = (leftHip.x + rightHip.x) / 2;
                            const hipMidY = (leftHip.y + rightHip.y) / 2;
                            
                            // Draw ideal vertical line
                            ctx.beginPath();
                            ctx.moveTo(shoulderMidX, shoulderMidY - 50);
                            ctx.lineTo(hipMidX, hipMidY + 50);
                            ctx.stroke();
                        }
                    }

                    if (postureStatus.issues.some(i => i.includes('Leaning'))) {
                        // Show ideal horizontal shoulder line
                        if (leftShoulder && rightShoulder) {
                            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
                            ctx.beginPath();
                            ctx.moveTo(leftShoulder.x - 30, shoulderMidY);
                            ctx.lineTo(rightShoulder.x + 30, shoulderMidY);
                            ctx.stroke();
                        }
                    }

                    if (postureStatus.issues.some(i => i.includes('Forward head'))) {
                        // Show ideal head position
                        if (nose && leftShoulder && rightShoulder) {
                            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
                            ctx.beginPath();
                            ctx.moveTo(shoulderMidX, nose.y - 30);
                            ctx.lineTo(shoulderMidX, nose.y + 30);
                            ctx.stroke();
                        }
                    }

                    ctx.setLineDash([]); // Reset dash
                }

                // Create detailed status with suggestions
                let statusText = '';
                let suggestions: string[] = [];
                
                if (postureStatus.issues.length > 0) {
                    statusText = `⚠ ${postureStatus.status} (${postureStatus.score}%)`;
                    
                    // Add specific suggestions based on issues
                    if (postureStatus.issues.some(i => i.includes('Slouching'))) {
                        suggestions.push('💡 Sit up straight, align your back');
                    }
                    if (postureStatus.issues.some(i => i.includes('Leaning'))) {
                        suggestions.push('💡 Move your shoulders up and level them');
                    }
                    if (postureStatus.issues.some(i => i.includes('Forward head'))) {
                        suggestions.push('💡 Pull your head back, align with shoulders');
                    }
                } else {
                    statusText = `✓ Good posture (${postureStatus.score}%)`;
                    suggestions.push('✅ Great! Keep maintaining this posture');
                }
                
                setCurrentStatus(statusText);

                // Update history with suggestions (throttled to once per second)
                const now = new Date();
                const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                let suggestion = '';
                if (postureStatus.issues.length > 0) {
                    if (postureStatus.issues.some(i => i.includes('Slouching'))) {
                        suggestion = '💡 Sit up straight, align your back';
                    } else if (postureStatus.issues.some(i => i.includes('Leaning'))) {
                        suggestion = '💡 Move your shoulders up and level them';
                    } else if (postureStatus.issues.some(i => i.includes('Forward head'))) {
                        suggestion = '💡 Pull your head back, align with shoulders';
                    }
                } else {
                    suggestion = '✅ Great! Keep maintaining this posture';
                }
                
                setHistory(prev => {
                    const lastEntry = prev[prev.length - 1];
                    const label = postureStatus.status;
                    if (!lastEntry || lastEntry.time !== currentTime || lastEntry.label !== label) {
                        return [...prev.slice(-19), { time: currentTime, label, type: 'posture', suggestion }];
                    }
                    return prev;
                });
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setCurrentStatus('No pose detected');
            }

            animationFrameRef.current = requestAnimationFrame(analyzePostureFrame);
        } catch (error) {
            console.error('Error in posture detection:', error);
            setCurrentStatus('Detection error');
            animationFrameRef.current = requestAnimationFrame(analyzePostureFrame);
        }
    };

    const startAnalysis = async () => {
        // Ensure models are loaded before starting
        if (!isModelLoaded) {
            console.warn('Models not loaded yet, waiting...');
            // Try to initialize models
            try {
                await initializeMoveNet();
                if (activeTab === 'mood') {
                    await initializeFaceAPI();
                }
                setIsModelLoaded(true);
            } catch (err) {
                console.error('Failed to load models:', err);
                setCurrentStatus('Failed to load AI models. Please refresh the page.');
                return;
            }
        }
        
        if (!webcamRef.current?.video) {
            console.warn('Webcam not ready');
            setCurrentStatus('Webcam not ready. Please enable camera.');
            return;
        }

        setIsAnalyzing(true);
        setHistory([]);
        setCurrentStatus('Starting detection...');
        
        // Small delay to ensure webcam is ready
        setTimeout(() => {
            if (activeTab === 'mood') {
                analyzeMoodFrame();
            } else {
                analyzePostureFrame();
            }
        }, 200);
    };

    const stopAnalysis = () => {
        setIsAnalyzing(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    useEffect(() => {
        // When tab changes, restart analysis if it was already running
        if (isAnalyzing && isModelLoaded && cameraPermission === 'granted') {
            stopAnalysis();
            setTimeout(() => {
                if (activeTab === 'mood') {
                    analyzeMoodFrame();
                } else {
                    analyzePostureFrame();
                }
            }, 100);
        } else if (!isAnalyzing && isModelLoaded && cameraPermission === 'granted') {
            // If not analyzing but conditions are met, auto-start
            const checkVideo = () => {
                const video = webcamRef.current?.video;
                if (video && video.readyState >= 2) {
                    console.log(`🎬 Tab changed to ${activeTab}, auto-starting...`);
                    startAnalysis();
                } else {
                    setTimeout(checkVideo, 200);
                }
            };
            setTimeout(checkVideo, 300);
        }
    }, [activeTab]);

    // Ensure webcam video is playing when permission is granted
    useEffect(() => {
        if (cameraPermission === 'granted' && webcamRef.current?.video) {
            const video = webcamRef.current.video;
            if (video.paused) {
                video.play().catch(err => {
                    console.error('Error playing video:', err);
                });
            }
        }
    }, [cameraPermission]);

    // Auto-start analysis when models are loaded and camera is ready
    useEffect(() => {
        if (isModelLoaded && !isAnalyzing && cameraPermission === 'granted') {
            // Check if video is ready
            const checkVideo = () => {
                const video = webcamRef.current?.video;
                if (video && video.readyState >= 2) {
                    console.log(`🎬 Auto-starting ${activeTab} analysis...`);
                    startAnalysis();
                } else {
                    // Retry after a short delay (max 10 attempts = 2 seconds)
                    const attempts = checkVideo['attempts'] || 0;
                    if (attempts < 10) {
                        checkVideo['attempts'] = attempts + 1;
                        setTimeout(checkVideo, 200);
                    } else {
                        console.log('⚠️ Video not ready after multiple attempts');
                    }
                }
            };
            
            // Reset attempts counter
            checkVideo['attempts'] = 0;
            const timer = setTimeout(checkVideo, 500);
            return () => clearTimeout(timer);
        }
    }, [isModelLoaded, cameraPermission, activeTab]);

    const getMoodEmoji = (mood: string) => {
        if (mood.includes('Happy')) return '😊';
        if (mood.includes('Neutral')) return '😐';
        if (mood.includes('Sad')) return '😢';
        if (mood.includes('Stressed')) return '😰';
        return '🤔';
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-zinc-900">
                <button
                    onClick={() => setActiveTab('mood')}
                    className={`flex-1 px-4 py-3 font-semibold transition-colors ${activeTab === 'mood'
                        ? 'bg-orange-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                >
                    <Smile className="w-5 h-5 inline mr-2" />
                    Mood Detector
                </button>
                <button
                    onClick={() => setActiveTab('posture')}
                    className={`flex-1 px-4 py-3 font-semibold transition-colors ${activeTab === 'posture'
                        ? 'bg-orange-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                >
                    <Activity className="w-5 h-5 inline mr-2" />
                    Posture Detector
                </button>
            </div>

            {/* Main Content - Camera on left, Live Updates on right */}
            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
                {/* Camera Preview - Bigger */}
                <div className="flex-1 relative bg-black rounded-xl overflow-hidden min-w-0">
                    {cameraPermission === 'granted' ? (
                        <>
                            <Webcam
                                ref={webcamRef}
                                className="absolute inset-0 w-full h-full object-cover"
                                videoConstraints={{ 
                                    facingMode: 'user', 
                                    width: { ideal: 1280 },
                                    height: { ideal: 720 }
                                }}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                onUserMedia={() => {
                                    console.log('Webcam started');
                                    if (webcamRef.current?.video) {
                                        webcamRef.current.video.play().catch(err => {
                                            console.error('Error playing video:', err);
                                        });
                                        // Trigger auto-start check when webcam is ready
                                        if (isModelLoaded && !isAnalyzing && cameraPermission === 'granted') {
                                            setTimeout(() => {
                                                console.log('🎬 Webcam ready, auto-starting analysis...');
                                                startAnalysis();
                                            }, 500);
                                        }
                                    }
                                }}
                                onUserMediaError={(error) => {
                                    console.error('Webcam error:', error);
                                    setCameraPermission('denied');
                                }}
                            />
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full pointer-events-none"
                            />

                            {/* Live Status Overlay */}
                            <AnimatePresence>
                                {isAnalyzing && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
                                    >
                                        <div className="bg-orange-600/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg border border-orange-500">
                                            <div className="font-bold text-lg">{currentStatus}</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Camera className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Camera Access Required
                                </h3>
                                <p className="text-zinc-400 mb-6 max-w-sm">
                                    We need camera access to analyze your {activeTab === 'mood' ? 'facial expressions' : 'posture'}
                                </p>
                                <button
                                    onClick={handleCameraPermission}
                                    className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors"
                                >
                                    Enable Camera
                                </button>
                            </div>
                        </div>
                    )}

                    {!isModelLoaded && cameraPermission === 'granted' && (
                        <div className="absolute top-4 left-4 bg-yellow-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                            Loading AI Model...
                        </div>
                    )}
                </div>

                {/* Live Updates Panel - Right Side */}
                <div className="w-80 flex flex-col gap-4 min-w-[320px]">
                    {/* Current Status Card */}
                    <div className="bg-zinc-800/90 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wide">Live Status</h3>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStatus}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3"
                            >
                                {activeTab === 'mood' && (
                                    <span className="text-3xl">{getMoodEmoji(currentStatus)}</span>
                                )}
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-white">{currentStatus}</div>
                                    <div className="text-xs text-white/50 mt-1">
                                        {isAnalyzing ? 'Detecting...' : 'Not active'}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="bg-zinc-800/90 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <button
                            onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                            disabled={!isModelLoaded || cameraPermission !== 'granted'}
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${isAnalyzing
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-orange-600 hover:bg-orange-700 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {!isModelLoaded ? '⏳ Loading Models...' : isAnalyzing ? '⏸ Stop Analysis' : '▶ Start Analysis'}
                        </button>
                        {!isModelLoaded && (
                            <p className="text-xs text-white/50 mt-2 text-center">
                                Please wait for models to load...
                            </p>
                        )}
                    </div>

                    {/* Live Updates History with Suggestions */}
                    <div className="flex-1 bg-zinc-800/90 backdrop-blur-sm rounded-xl p-4 border border-white/10 overflow-hidden flex flex-col">
                        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Live Updates & Suggestions</h3>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {history.length > 0 ? (
                                <>
                                    {history.map((entry, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex flex-col gap-1 text-sm bg-white/5 rounded-lg px-3 py-2 border border-white/5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/60 text-xs">{entry.time}</span>
                                                <span className="text-white font-medium flex items-center gap-2">
                                                    {entry.type === 'mood' && <span className="text-lg">{getMoodEmoji(entry.label)}</span>}
                                                    <span className="text-xs">{entry.label}</span>
                                                </span>
                                            </div>
                                            {/* Show suggestions */}
                                            {entry.suggestion && (
                                                <span className={`text-xs ${entry.type === 'posture' ? 'text-orange-400' : 'text-blue-400'}`}>
                                                    {entry.suggestion}
                                                </span>
                                            )}
                                        </motion.div>
                                    ))}
                                </>
                            ) : (
                                <p className="text-white/40 text-sm text-center py-8">
                                    {isAnalyzing ? 'Waiting for detections...' : 'Start analysis to see live updates'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
