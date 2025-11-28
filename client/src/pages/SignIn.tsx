import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '@/lib/firebase.config';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

export default function SignIn() {
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            await signInWithGoogle();
            // Redirect to dashboard after successful sign-in
            setLocation('/agent');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logoria.gif"
                            alt="Ria logo"
                            className="h-20 w-20 object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Ria</h1>
                    <p className="text-gray-600">Your AI-powered wellness companion</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                        Sign in to continue
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            <span className="flex items-center gap-3">
                                <Chrome className="w-6 h-6" />
                                Sign in with Google
                            </span>
                        )}
                    </Button>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                        ← Back to home
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
