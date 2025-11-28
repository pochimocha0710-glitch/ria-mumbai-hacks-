import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

let detector: poseDetection.PoseDetector | null = null;
let isInitializing = false;

export interface PostureStatus {
    status: 'good' | 'slouching' | 'leaning_left' | 'leaning_right' | 'forward_head';
    score: number;
    issues: string[];
}

export async function initializeMoveNet() {
    if (detector) return detector;
    if (isInitializing) {
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return detector;
    }

    isInitializing = true;
    try {
        console.log('🔄 Initializing TensorFlow.js...');
        // Ensure TensorFlow.js is ready
        await tf.ready();
        console.log('✅ TensorFlow.js ready');

        console.log('🔄 Loading MoveNet model...');
        
        // Use MoveNet Lightning (fastest, 2-3ms inference)
        const model = poseDetection.SupportedModels.MoveNet;
        detector = await poseDetection.createDetector(model, {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
            minPoseScore: 0.25
        });

        isInitializing = false;
        console.log('✅ MoveNet model loaded successfully');
        return detector;
    } catch (error) {
        console.error('❌ Error loading MoveNet model:', error);
        // Fallback to BlazePose if MoveNet fails
        try {
            console.log('🔄 Trying BlazePose as fallback...');
            const model = poseDetection.SupportedModels.BlazePose;
            detector = await poseDetection.createDetector(model, {
                runtime: 'tfjs',
                modelType: 'lite',
                enableSmoothing: true
            });
            isInitializing = false;
            console.log('✅ BlazePose model loaded as fallback');
            return detector;
        } catch (fallbackError) {
            isInitializing = false;
            console.error('❌ Fallback also failed:', fallbackError);
            // Return null instead of throwing - allow app to show error
            return null;
        }
    }
}

export async function detectPose(videoElement: HTMLVideoElement): Promise<poseDetection.Pose[] | null> {
    if (!detector) {
        await initializeMoveNet();
    }

    if (!detector) {
        return null;
    }

    try {
        const poses = await detector.estimatePoses(videoElement, {
            maxPoses: 1,
            flipHorizontal: false
        });
        return poses;
    } catch (error) {
        console.error('Error detecting pose:', error);
        return null;
    }
}

export function analyzePosture(poses: poseDetection.Pose[]): PostureStatus {
    if (!poses || poses.length === 0) {
        return {
            status: 'good',
            score: 0,
            issues: ['No pose detected']
        };
    }

    const pose = poses[0];
    const keypoints = pose.keypoints;
    const issues: string[] = [];
    let score = 100;

    // Get key points (MoveNet keypoint indices)
    // MoveNet has 17 keypoints: nose, left_eye, right_eye, left_ear, right_ear, 
    // left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist,
    // left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle
    
    const nose = keypoints.find(kp => kp.name === 'nose');
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');

    if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        return {
            status: 'good',
            score: 0,
            issues: ['Insufficient keypoints detected']
        };
    }

    // Check shoulder alignment (slouching)
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const torsoLength = Math.abs(shoulderMidY - hipMidY);
    
    // If torso is too short, person is slouching
    if (torsoLength < 150) { // Adjust threshold based on your needs
        issues.push('Slouching detected');
        score -= 30;
    }

    // Check shoulder level (leaning)
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderDiff > 20) {
        if (leftShoulder.y > rightShoulder.y) {
            issues.push('Leaning left');
            score -= 20;
        } else {
            issues.push('Leaning right');
            score -= 20;
        }
    }

    // Check forward head posture
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const headForward = Math.abs(nose.x - shoulderMidX);
    if (headForward > 30) {
        issues.push('Forward head posture');
        score -= 25;
    }

    // Determine status
    let status: 'good' | 'slouching' | 'leaning_left' | 'leaning_right' | 'forward_head' = 'good';
    
    if (issues.some(i => i.includes('Slouching'))) {
        status = 'slouching';
    } else if (issues.some(i => i.includes('Leaning left'))) {
        status = 'leaning_left';
    } else if (issues.some(i => i.includes('Leaning right'))) {
        status = 'leaning_right';
    } else if (issues.some(i => i.includes('Forward head'))) {
        status = 'forward_head';
    }

    return {
        status,
        score: Math.max(0, score),
        issues: issues.length > 0 ? issues : []
    };
}

