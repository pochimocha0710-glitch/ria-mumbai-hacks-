import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface MoodDetection {
    mood: string;
    confidence: number;
    timestamp: Date;
    expressions: {
        happy: number;
        sad: number;
        angry: number;
        neutral: number;
        surprised: number;
    };
}

export const useFaceDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [currentMood, setCurrentMood] = useState<MoodDetection | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Load MediaPipe FaceLandmarker
    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log('🔄 Loading MediaPipe Face Landmarker...');
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );
                console.log('✅ Vision tasks loaded');

                const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU'
                    },
                    outputFaceBlendshapes: true,
                    outputFacialTransformationMatrixes: true,
                    runningMode: 'VIDEO',
                    numFaces: 1
                });

                faceLandmarkerRef.current = faceLandmarker;
                setIsModelLoaded(true);
                console.log('✅ MediaPipe Face Landmarker loaded successfully!');
            } catch (error) {
                console.error('❌ Error loading MediaPipe Face Landmarker:', error);
            }
        };

        loadModel();

        return () => {
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close();
            }
        };
    }, []);

    // Analyze facial expressions from blendshapes
    const analyzeMood = (blendshapes: any[]): MoodDetection => {
        const expressions = {
            happy: 0,
            sad: 0,
            angry: 0,
            neutral: 1,
            surprised: 0
        };

        if (blendshapes && blendshapes.length > 0) {
            const shapes = blendshapes[0].categories;

            // Map MediaPipe blendshapes to emotions
            shapes.forEach((shape: any) => {
                const name = shape.categoryName.toLowerCase();
                const score = shape.score;

                if (name.includes('smile') || name.includes('mouthsmile')) {
                    expressions.happy = Math.max(expressions.happy, score);
                } else if (name.includes('frown') || name.includes('mouthfrown')) {
                    expressions.sad = Math.max(expressions.sad, score);
                } else if (name.includes('browdown') || name.includes('browlowerer')) {
                    expressions.angry = Math.max(expressions.angry, score);
                } else if (name.includes('eyewideopen') || name.includes('jawopen')) {
                    expressions.surprised = Math.max(expressions.surprised, score);
                }
            });

            // Calculate neutral as inverse of other emotions
            const totalEmotions = expressions.happy + expressions.sad + expressions.angry + expressions.surprised;
            expressions.neutral = Math.max(0, 1 - totalEmotions);
        }

        // Find dominant emotion
        const dominant = Object.entries(expressions).reduce((a, b) =>
            expressions[a[0] as keyof typeof expressions] > expressions[b[0] as keyof typeof expressions] ? a : b
        );

        const moodMap: { [key: string]: string } = {
            happy: 'Happy 😊',
            sad: 'Sad 😢',
            angry: 'Angry 😠',
            neutral: 'Neutral 😐',
            surprised: 'Surprised 😲'
        };

        return {
            mood: moodMap[dominant[0]] || 'Neutral 😐',
            confidence: dominant[1] * 100,
            timestamp: new Date(),
            expressions
        };
    };

    // Detection loop
    const detectFace = () => {
        if (!videoRef.current || !faceLandmarkerRef.current || !isDetecting) return;

        const video = videoRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const startTimeMs = performance.now();
            const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);

            // Draw landmarks on canvas
            if (canvasRef.current && results.faceLandmarks && results.faceLandmarks.length > 0) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const drawingUtils = new DrawingUtils(ctx);

                    // Draw face mesh with green color
                    for (const landmarks of results.faceLandmarks) {
                        drawingUtils.drawConnectors(
                            landmarks,
                            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                            { color: '#00FF00', lineWidth: 1 }
                        );
                        drawingUtils.drawConnectors(
                            landmarks,
                            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                            { color: '#FF3030' }
                        );
                        drawingUtils.drawConnectors(
                            landmarks,
                            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                            { color: '#30FF30' }
                        );
                        drawingUtils.drawConnectors(
                            landmarks,
                            FaceLandmarker.FACE_LANDMARKS_LIPS,
                            { color: '#E0E0E0' }
                        );
                    }
                }
            }

            // Analyze mood from blendshapes
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                const moodData = analyzeMood(results.faceBlendshapes);
                setCurrentMood(moodData);
            }
        }

        animationFrameRef.current = requestAnimationFrame(detectFace);
    };

    // Start detection
    const startDetection = () => {
        console.log('🎬 Starting face detection...');
        console.log('Model loaded:', isModelLoaded);
        console.log('Face landmarker:', faceLandmarkerRef.current);
        console.log('Is detecting:', isDetecting);

        if (!isModelLoaded) {
            console.warn('⚠️ Model not loaded yet');
            return;
        }
        if (!faceLandmarkerRef.current) {
            console.warn('⚠️ Face landmarker not initialized');
            return;
        }
        if (isDetecting) {
            console.warn('⚠️ Already detecting');
            return;
        }

        // Create canvas overlay
        if (videoRef.current && !canvasRef.current) {
            console.log('📊 Creating canvas overlay');
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
            console.log('✅ Canvas created');
        }

        setIsDetecting(true);
        console.log('✅ Detection started, beginning loop');
        detectFace();
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
        currentMood,
        isDetecting,
        startDetection,
        stopDetection
    };
};
