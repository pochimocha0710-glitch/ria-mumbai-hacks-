// @ts-ignore - face-api.js doesn't have perfect TypeScript support
import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let isInitializing = false;

export interface EmotionResult {
    expression: string;
    probability: number;
}

export async function initializeFaceAPI() {
    if (modelsLoaded) return true;
    if (isInitializing) {
        // Wait for existing initialization
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return modelsLoaded;
    }

    isInitializing = true;
    try {
        console.log('🔄 Loading face-api.js models...');
        
        // Try multiple CDN paths for reliability
        const MODEL_URLS = [
            'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
            'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
            'https://unpkg.com/face-api.js@0.22.2/weights'
        ];
        
        let loaded = false;
        for (const MODEL_URL of MODEL_URLS) {
            try {
                console.log(`Trying to load from: ${MODEL_URL}`);
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                loaded = true;
                console.log(`✅ face-api.js models loaded from ${MODEL_URL}`);
                break;
            } catch (urlError) {
                console.warn(`Failed to load from ${MODEL_URL}:`, urlError);
                continue;
            }
        }

        if (!loaded) {
            throw new Error('All CDN sources failed');
        }

        modelsLoaded = true;
        isInitializing = false;
        return true;
    } catch (error) {
        isInitializing = false;
        console.error('❌ Error loading face-api.js models:', error);
        // Don't throw - allow app to continue with posture detection only
        console.warn('⚠️ Continuing without face detection...');
        return false;
    }
}

export async function detectEmotion(videoElement: HTMLVideoElement): Promise<EmotionResult | null> {
    if (!modelsLoaded) {
        await initializeFaceAPI();
    }

    try {
        // Detect face and expressions
        const detections = await faceapi
            .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

        if (!detections) {
            return null;
        }

        // Get the emotion with highest probability
        const expressions = detections.expressions;
        let maxExpression = 'neutral';
        let maxProbability = expressions.neutral;

        for (const [expression, probability] of Object.entries(expressions)) {
            if (probability > maxProbability) {
                maxProbability = probability;
                maxExpression = expression;
            }
        }

        // Map face-api emotions to our format
        const emotionMap: { [key: string]: string } = {
            'happy': 'Happy',
            'sad': 'Sad',
            'angry': 'Angry',
            'neutral': 'Neutral',
            'surprised': 'Surprised',
            'disgusted': 'Stressed',
            'fearful': 'Stressed'
        };

        return {
            expression: emotionMap[maxExpression] || 'Neutral',
            probability: maxProbability
        };
    } catch (error) {
        console.error('Error detecting emotion:', error);
        return null;
    }
}

export function isSmiling(expressions: faceapi.FaceExpressions): boolean {
    return expressions.happy > 0.5;
}

