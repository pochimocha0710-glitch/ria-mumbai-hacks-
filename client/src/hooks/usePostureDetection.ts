import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface PostureDetection {
    status: string;
    score: number;
    timestamp: Date;
    issues: string[];
}

export const usePostureDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [currentPosture, setCurrentPosture] = useState<PostureDetection | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Load MediaPipe PoseLandmarker
    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log('🔄 Loading MediaPipe Pose Landmarker...');
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );
                console.log('✅ Vision tasks loaded for pose');

                const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                        delegate: 'GPU'
                    },
                    runningMode: 'VIDEO',
                    numPoses: 1
                });

                poseLandmarkerRef.current = poseLandmarker;
                setIsModelLoaded(true);
                console.log('✅ MediaPipe Pose Landmarker loaded successfully!');
            } catch (error) {
                console.error('❌ Error loading MediaPipe Pose Landmarker:', error);
            }
        };

        loadModel();

        return () => {
            if (poseLandmarkerRef.current) {
                poseLandmarkerRef.current.close();
            }
        };
    }, []);

    // Analyze posture from landmarks
    const analyzePosture = (landmarks: any[]): PostureDetection => {
        const issues: string[] = [];
        let score = 100;

        if (landmarks && landmarks.length > 0) {
            const pose = landmarks[0];

            // Get key points (MediaPipe pose landmarks indices)
            const leftShoulder = pose[11];
            const rightShoulder = pose[12];
            const leftHip = pose[23];
            const rightHip = pose[24];
            const nose = pose[0];

            // Check shoulder alignment
            if (leftShoulder && rightShoulder) {
                const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
                if (shoulderDiff > 0.05) {
                    issues.push('⚠️ Uneven shoulders detected');
                    score -= 20;
                }
            }

            // Check forward head posture
            if (nose && leftShoulder && rightShoulder) {
                const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
                const headForward = Math.abs(nose.x - shoulderMidX);

                if (headForward > 0.08) {
                    issues.push('⚠️ Forward head posture');
                    score -= 25;
                }
            }

            // Check spine alignment
            if (leftShoulder && rightShoulder && leftHip && rightHip) {
                const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
                const hipMidY = (leftHip.y + rightHip.y) / 2;
                const torsoLength = Math.abs(shoulderMidY - hipMidY);

                if (torsoLength < 0.3) {
                    issues.push('⚠️ Slouching detected');
                    score -= 20;
                }
            }

            // Check hip alignment
            if (leftHip && rightHip) {
                const hipDiff = Math.abs(leftHip.y - rightHip.y);
                if (hipDiff > 0.05) {
                    issues.push('⚠️ Uneven hips');
                    score -= 15;
                }
            }
        }

        let status = 'Excellent ✅';
        if (score >= 80) status = 'Good ✅';
        else if (score >= 60) status = 'Fair ⚠️';
        else if (score >= 40) status = 'Poor ⚠️';
        else status = 'Very Poor ❌';

        if (issues.length === 0) {
            issues.push('✅ Perfect posture!');
        }

        return {
            status,
            score: Math.max(0, score),
            timestamp: new Date(),
            issues
        };
    };

    // Detection loop
    const detectPose = () => {
        if (!videoRef.current || !poseLandmarkerRef.current || !isDetecting) return;

        const video = videoRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const startTimeMs = performance.now();
            const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

            // Draw pose landmarks on canvas with GREEN lines
            if (canvasRef.current && results.landmarks && results.landmarks.length > 0) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const drawingUtils = new DrawingUtils(ctx);

                    // Draw pose skeleton with bright green color
                    for (const landmark of results.landmarks) {
                        drawingUtils.drawLandmarks(landmark, {
                            color: '#00FF00',
                            fillColor: '#00FF00',
                            radius: 6
                        });
                        drawingUtils.drawConnectors(
                            landmark,
                            PoseLandmarker.POSE_CONNECTIONS,
                            { color: '#00FF00', lineWidth: 4 }
                        );
                    }
                }
            }

            // Analyze posture
            if (results.landmarks && results.landmarks.length > 0) {
                const postureData = analyzePosture(results.landmarks);
                setCurrentPosture(postureData);
            }
        }

        animationFrameRef.current = requestAnimationFrame(detectPose);
    };

    // Start detection
    const startDetection = () => {
        console.log('🎬 Starting pose detection...');
        console.log('Model loaded:', isModelLoaded);
        console.log('Pose landmarker:', poseLandmarkerRef.current);
        console.log('Is detecting:', isDetecting);

        if (!isModelLoaded) {
            console.warn('⚠️ Pose model not loaded yet');
            return;
        }
        if (!poseLandmarkerRef.current) {
            console.warn('⚠️ Pose landmarker not initialized');
            return;
        }
        if (isDetecting) {
            console.warn('⚠️ Already detecting pose');
            return;
        }

        // Create canvas overlay
        if (videoRef.current && !canvasRef.current) {
            console.log('📊 Creating canvas overlay for pose');
            const canvas = document.createElement('canvas');
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '10';
            videoRef.current.parentElement?.appendChild(canvas);
            canvasRef.current = canvas;
            console.log('✅ Canvas created for pose');
        }

        setIsDetecting(true);
        console.log('✅ Pose detection started, beginning loop');
        detectPose();
    };

    // Stop detection
    const stopDetection = () => {
        setIsDetecting(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (canvasRef.current) {
            canvasRef.current.remove();
            canvasRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            stopDetection();
        };
    }, []);

    return {
        isModelLoaded,
        currentPosture,
        isDetecting,
        startDetection,
        stopDetection
    };
};
