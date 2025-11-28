// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAPivtbnPyUM0CZWJ2QGIr_9JnNM_-87G8",
    authDomain: "ria-new.firebaseapp.com",
    projectId: "ria-new",
    storageBucket: "ria-new.firebasestorage.app",
    messagingSenderId: "64303120014",
    appId: "1:64303120014:web:7a724156580dbe5c1f13df",
    measurementId: "G-1SHJ6T2VST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Create user document in Firestore if it doesn't exist
        await createUserDocument(user);

        return user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

// Sign out
export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

// Create user document in Firestore
export const createUserDocument = async (user: User) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = new Date();

        try {
            await setDoc(userRef, {
                email,
                displayName,
                photoURL,
                createdAt,
                points: 0,
                streak: 0,
                xp: 0,
                level: 1,
                tasksCompleted: 0
            });
        } catch (error) {
            console.error('Error creating user document:', error);
        }
    }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

// Save detection history
export const saveDetectionHistory = async (userId: string, type: 'mood' | 'posture', data: any) => {
    try {
        const historyRef = collection(db, 'detectionHistory');
        await addDoc(historyRef, {
            userId,
            type,
            ...data,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error saving detection history:', error);
        throw error;
    }
};

// Get detection history
export const getDetectionHistory = async (userId: string, type: 'mood' | 'posture', limitCount: number = 10) => {
    try {
        const historyRef = collection(db, 'detectionHistory');
        const q = query(
            historyRef,
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const history: any[] = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.userId === userId && data.type === type) {
                history.push({ id: docSnap.id, ...data });
            }
        });

        return history;
    } catch (error) {
        console.error('Error getting detection history:', error);
        throw error;
    }
};

// Update user XP
export const updateUserXP = async (userId: string, xpAmount: number) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const currentXP = userSnap.data().xp || 0;
            const currentLevel = userSnap.data().level || 1;
            const newXP = currentXP + xpAmount;

            // Calculate new level (500 XP per level)
            const newLevel = Math.floor(newXP / 500) + 1;

            await updateDoc(userRef, {
                xp: newXP,
                level: newLevel
            });

            return { xp: newXP, level: newLevel };
        }
    } catch (error) {
        console.error('Error updating user XP:', error);
        throw error;
    }
};

// Save task completion
export const saveTaskCompletion = async (userId: string, taskId: string, proofUrl: string, xpEarned: number) => {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await setDoc(taskRef, {
            userId,
            completed: true,
            proofUrl,
            xpEarned,
            completedAt: new Date()
        }, { merge: true });

        // Update user XP
        await updateUserXP(userId, xpEarned);
    } catch (error) {
        console.error('Error saving task completion:', error);
        throw error;
    }
};

// Save user journey data
export const saveJourneyData = async (userId: string, journeyData: any) => {
    try {
        const journeyRef = doc(db, 'journeys', userId);
        await setDoc(journeyRef, {
            ...journeyData,
            updatedAt: new Date(),
        }, { merge: true });
    } catch (error) {
        console.error('Error saving journey data:', error);
        throw error;
    }
};

// Save user routine
export const saveRoutine = async (userId: string, routine: any) => {
    try {
        const routineRef = doc(db, 'routines', userId);
        await setDoc(routineRef, {
            ...routine,
            updatedAt: new Date(),
        }, { merge: true });
    } catch (error) {
        console.error('Error saving routine:', error);
        throw error;
    }
};

// Get leaderboard
export const getLeaderboard = async (limitCount: number = 10) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('points', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);

        const leaderboard: any[] = [];
        querySnapshot.forEach((docSnap) => {
            leaderboard.push({ id: docSnap.id, ...docSnap.data() });
        });

        return leaderboard;
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        throw error;
    }
};

// Update user points (for leaderboard)
export const updateUserPoints = async (userId: string, points: number, streak: number = 0) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            points,
            streak,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating user points:', error);
        throw error;
    }
};

// Alias for backward compatibility
export const updateLeaderboardPoints = updateUserPoints;

// Get user journey data
export const getJourneyData = async (userId: string) => {
    try {
        const journeyRef = doc(db, 'journeys', userId);
        const journeySnap = await getDoc(journeyRef);

        if (journeySnap.exists()) {
            return journeySnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting journey data:', error);
        throw error;
    }
};

// Get user routine
export const getRoutine = async (userId: string) => {
    try {
        const routineRef = doc(db, 'routines', userId);
        const routineSnap = await getDoc(routineRef);

        if (routineSnap.exists()) {
            return routineSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting routine:', error);
        throw error;
    }
};
