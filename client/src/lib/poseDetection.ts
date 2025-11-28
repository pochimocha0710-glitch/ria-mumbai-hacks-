import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;

export async function initializePoseDetector() {
  if (poseLandmarker) return poseLandmarker;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    try {
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      console.log('✅ Pose landmarker lite model loaded');
    } catch (liteError) {
      console.warn('Lite model failed, trying full model:', liteError);
      // Fallback to full model
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      console.log('✅ Pose landmarker full model loaded');
    }

    return poseLandmarker;
  } catch (error) {
    console.error('❌ Failed to initialize pose detector:', error);
    throw error;
  }
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface ExerciseFeedback {
  score: number;
  corrections: string[];
  repCount: number;
  isGoodForm: boolean;
}

// Calculate angle between three points
function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

// Calculate distance between two points
function calculateDistance(a: PoseLandmark, b: PoseLandmark): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export async function detectPose(videoElement: HTMLVideoElement, timestamp: number) {
  if (!poseLandmarker) {
    await initializePoseDetector();
  }

  if (!poseLandmarker) return null;

  const result = await poseLandmarker.detectForVideo(videoElement, timestamp);
  return result;
}

export function analyzePushUpForm(landmarks: PoseLandmark[]): ExerciseFeedback {
  const corrections: string[] = [];
  let score = 100;

  // Key landmarks for push-ups
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  // Check elbow angle (should be around 90 degrees at bottom)
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

  if (avgElbowAngle > 110 || avgElbowAngle < 70) {
    corrections.push("Bend your elbows to 90 degrees");
    score -= 15;
  }

  // Check body alignment (shoulder-hip-ankle should be straight)
  const leftBodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
  const rightBodyAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
  const avgBodyAngle = (leftBodyAngle + rightBodyAngle) / 2;

  if (avgBodyAngle < 160 || avgBodyAngle > 200) {
    corrections.push("Keep your body in a straight line");
    score -= 20;
  }

  // Check if hips are sagging
  const midHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2, z: 0 };
  const midShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2, z: 0 };
  
  if (midHip.y > midShoulder.y + 0.1) {
    corrections.push("Lift your hips - don't let them sag");
    score -= 15;
  }

  // Check hand position (should be shoulder-width apart)
  const handDistance = calculateDistance(leftWrist, rightWrist);
  const shoulderDistance = calculateDistance(leftShoulder, rightShoulder);
  
  if (handDistance < shoulderDistance * 0.8 || handDistance > shoulderDistance * 1.3) {
    corrections.push("Adjust hand width to shoulder-width apart");
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    corrections,
    repCount: 0, // This would be tracked separately with state
    isGoodForm: score >= 70
  };
}

export function analyzeSitUpForm(landmarks: PoseLandmark[]): ExerciseFeedback {
  const corrections: string[] = [];
  let score = 100;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const nose = landmarks[0];

  // Check knee angle (should be around 90 degrees)
  const leftKneeAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
  const rightKneeAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  if (avgKneeAngle < 70 || avgKneeAngle > 110) {
    corrections.push("Keep your knees bent at 90 degrees");
    score -= 15;
  }

  // Check if going up far enough (shoulders should come close to knees)
  const shoulderToKneeDistance = calculateDistance(
    { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2, z: 0 },
    { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2, z: 0 }
  );

  if (shoulderToKneeDistance > 0.3) {
    corrections.push("Come up higher - bring chest closer to knees");
    score -= 20;
  }

  // Check neck position
  const neckAngle = calculateAngle(nose, leftShoulder, leftHip);
  if (neckAngle < 30) {
    corrections.push("Don't strain your neck - keep it neutral");
    score -= 15;
  }

  return {
    score: Math.max(0, score),
    corrections,
    repCount: 0,
    isGoodForm: score >= 70
  };
}

export function analyzeSquatForm(landmarks: PoseLandmark[]): ExerciseFeedback {
  const corrections: string[] = [];
  let score = 100;

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // Check knee angle (should be around 90 degrees at bottom)
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  if (avgKneeAngle > 110) {
    corrections.push("Go deeper - squat until thighs are parallel to ground");
    score -= 20;
  } else if (avgKneeAngle < 70) {
    corrections.push("Don't go too deep - stop at 90 degrees");
    score -= 10;
  }

  // Check if knees go past toes
  const leftKneeToAnkle = leftKnee.x - leftAnkle.x;
  const rightKneeToAnkle = rightKnee.x - rightAnkle.x;
  
  if (Math.abs(leftKneeToAnkle) > 0.1 || Math.abs(rightKneeToAnkle) > 0.1) {
    corrections.push("Keep knees behind toes");
    score -= 15;
  }

  // Check back angle (should stay relatively upright)
  const backAngle = calculateAngle(
    { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2, z: 0 },
    { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2, z: 0 },
    { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2, z: 0 }
  );

  if (backAngle < 140) {
    corrections.push("Keep your chest up and back straight");
    score -= 15;
  }

  // Check feet alignment
  const feetDistance = calculateDistance(leftAnkle, rightAnkle);
  const shoulderDistance = calculateDistance(leftShoulder, rightShoulder);
  
  if (feetDistance < shoulderDistance * 0.8) {
    corrections.push("Widen your stance to shoulder-width");
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    corrections,
    repCount: 0,
    isGoodForm: score >= 70
  };
}

export function analyzePlankForm(landmarks: PoseLandmark[]): ExerciseFeedback {
  const corrections: string[] = [];
  let score = 100;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  // Check body alignment (shoulder-hip-ankle should be straight)
  const leftBodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
  const rightBodyAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
  const avgBodyAngle = (leftBodyAngle + rightBodyAngle) / 2;

  if (avgBodyAngle < 160 || avgBodyAngle > 200) {
    corrections.push("Keep your body in a straight line");
    score -= 25;
  }

  // Check if hips are too high or too low
  const midHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2, z: 0 };
  const midShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2, z: 0 };
  const midAnkle = { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2, z: 0 };

  const hipDeviation = Math.abs(midHip.y - (midShoulder.y + midAnkle.y) / 2);
  
  if (hipDeviation > 0.05) {
    if (midHip.y > (midShoulder.y + midAnkle.y) / 2) {
      corrections.push("Lower your hips - don't let them sag");
    } else {
      corrections.push("Lower your hips - don't pike up");
    }
    score -= 20;
  }

  // Check elbow position (should be directly under shoulders)
  const leftElbowToShoulder = Math.abs(leftElbow.x - leftShoulder.x);
  const rightElbowToShoulder = Math.abs(rightElbow.x - rightShoulder.x);
  
  if (leftElbowToShoulder > 0.1 || rightElbowToShoulder > 0.1) {
    corrections.push("Position elbows directly under shoulders");
    score -= 15;
  }

  return {
    score: Math.max(0, score),
    corrections,
    repCount: 0,
    isGoodForm: score >= 70
  };
}

export function calculateFormScore(landmarks: PoseLandmark[], exerciseType: string): number {
  switch (exerciseType.toLowerCase()) {
    case 'pushup':
    case 'push-up':
    case 'push up':
      return analyzePushUpForm(landmarks).score;
    case 'situp':
    case 'sit-up':
    case 'sit up':
      return analyzeSitUpForm(landmarks).score;
    case 'squat':
      return analyzeSquatForm(landmarks).score;
    case 'plank':
      return analyzePlankForm(landmarks).score;
    default:
      return 0;
  }
}

export function generateFeedback(landmarks: PoseLandmark[], exerciseType: string): ExerciseFeedback {
  switch (exerciseType.toLowerCase()) {
    case 'pushup':
    case 'push-up':
    case 'push up':
      return analyzePushUpForm(landmarks);
    case 'situp':
    case 'sit-up':
    case 'sit up':
      return analyzeSitUpForm(landmarks);
    case 'squat':
      return analyzeSquatForm(landmarks);
    case 'plank':
      return analyzePlankForm(landmarks);
    default:
      return {
        score: 0,
        corrections: ['Unknown exercise type'],
        repCount: 0,
        isGoodForm: false
      };
  }
}

export { DrawingUtils };
