# RIA - Wellness Aware Agentic AI 🧘‍♀️

> An AI-powered wellness companion featuring real-time posture detection, mood analysis, and personalized health routines.

![RIA Dashboard](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Latest-orange)

## ✨ Features

### 🎭 Real-Time AI Detection
- **Mood Detection**: Instant emotion recognition using MediaPipe Face Landmarker
  - Detects: Happy 😊, Sad 😢, Angry 😠, Neutral 😐, Surprised 😲
  - Visual face mesh overlay
  - Live confidence scores and expression breakdown
  
- **Posture Analysis**: Real-time body tracking with green skeleton overlay
  - Detects slouching, uneven shoulders, forward head posture
  - 0-100 posture scoring system
  - Instant feedback and corrections

### 🎯 Core Features
- **User Onboarding**: Personalized health profile setup
- **XP & Gamification**: Level up by completing wellness tasks
- **Google Calendar Integration**: Sync routines with your calendar
- **Firebase Backend**: Secure authentication and data storage
- **Leaderboard**: Compete with other users
- **AI Chat**: Wellness guidance and support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Google Cloud account (for Calendar API)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/piyushxt43/ria-test-1.git
cd ria-test-1
```

2. **Install dependencies**
```bash
npm install
```

3. **Firebase Configuration**

The Firebase configuration is already included in `client/src/lib/firebase.config.ts` for production use. No environment variables are needed.

**Current Firebase Project:**
- Project ID: `ria-new`
- Auth Domain: `ria-new.firebaseapp.com`
- All configuration is hardcoded for easy deployment

**Note:** For production deployment, the Firebase config is already set up and ready to use. Simply deploy and the app will work immediately.

4. **Run the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 📦 Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.6.3** - Type safety
- **Vite 5.4.20** - Build tool
- **Tailwind CSS 3.4.17** - Styling
- **Framer Motion 11.13.1** - Animations
- **Wouter 3.3.5** - Routing

### AI & Detection
- **MediaPipe Tasks Vision** - Real-time face and pose detection
  - Face Landmarker for emotion recognition
  - Pose Landmarker for posture analysis
- **TensorFlow.js 4.22.0** - ML infrastructure
- **@mediapipe/tasks-vision** - Vision tasks

### Backend & Services
- **Firebase 12.6.0** - Authentication, Firestore, Analytics
- **Google APIs** - Calendar integration
- **Express 4.21.2** - Server

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons
- **React Hook Form** - Form management

## 🏗️ Project Structure

```
ria-test-1/
├── client/                    # Frontend application
│   ├── public/
│   │   ├── logoria.gif       # App logo
│   │   └── mainbg1.png       # Background assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # UI primitives
│   │   │   ├── UnifiedHeader.tsx
│   │   │   ├── UserOnboarding.tsx
│   │   │   ├── RiaChat.tsx
│   │   │   └── ...
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useFaceDetection.ts    # MediaPipe face detection
│   │   │   └── usePostureDetection.ts # MediaPipe pose detection
│   │   ├── lib/             # Utilities and configs
│   │   │   ├── firebase.config.ts     # Firebase setup
│   │   │   └── googleCalendar.ts      # Calendar integration
│   │   ├── pages/           # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── ...
│   │   └── App.tsx          # Main app component
│   └── index.html
├── server/                   # Backend server
│   └── index-dev.ts
├── package.json
└── README.md
```

## 🎮 Usage

### Dashboard
1. Sign in with Google
2. Complete onboarding (age, height, weight, health info, goals)
3. Navigate to Dashboard

### Mood Detection
1. Click "Mood Detection" tab
2. Click "Start Camera"
3. See instant emotion recognition with face mesh overlay
4. View live results on the right panel

### Posture Detection
1. Click "Posture Detection" tab
2. Click "Start Camera"
3. See green skeleton tracking your body
4. Get real-time posture feedback and scoring

### Tasks & Gamification
1. View daily tasks in "Tasks" tab
2. Complete tasks to earn XP
3. Level up and climb the leaderboard

### Weekly Planner & Calendar
1. **Automatic Task Generation**: When you complete the onboarding journey and enter your disease/problem information, the system automatically generates a full week of personalized tasks
2. **Enhanced Calendar View**: The weekly planner displays all tasks in a beautiful 7-day calendar grid
3. **Real-time Updates**: Tasks are automatically synced to the calendar section on the dashboard
4. **Task Visibility**: Each day shows task count, completion status, and XP rewards

## 🔧 Configuration

### Firebase Setup
The Firebase project is already configured:
- **Project**: `ria-new`
- **Authentication**: Google Sign-In enabled
- **Firestore**: Database ready for use
- **Config Location**: `client/src/lib/firebase.config.ts`

No additional setup needed - the app is production-ready!

### Google Calendar API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and API Key to `.env`

## 🌐 Deployment

### Production Ready
This project is **production-ready** with all Firebase configuration included. No environment variables needed!

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. The build will automatically use the included Firebase config
3. No environment variables needed - everything is configured!

### GitHub Repository
Push to: `https://github.com/Ankur-Tiwarii/ria-mumbai-hacks-`

## 📊 MediaPipe Models

The app uses Google's MediaPipe for instant AI detection:

- **Face Landmarker**: Detects 478 facial landmarks and 52 blendshapes
  - Model: `face_landmarker.task` (~3MB)
  - Loaded from CDN: No downloads needed
  
- **Pose Landmarker**: Tracks 33 body landmarks
  - Model: `pose_landmarker_lite.task` (~5MB)
  - Loaded from CDN: No downloads needed

Both models load in <1 second and run at 30-60 FPS on modern devices.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **MediaPipe** by Google for real-time ML models
- **Firebase** for backend infrastructure
- **Radix UI** for accessible components
- **Tailwind CSS** for styling system

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ for wellness and health
