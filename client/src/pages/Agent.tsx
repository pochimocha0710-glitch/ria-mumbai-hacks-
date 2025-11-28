import { useState } from "react";
import RiaChat from "@/components/RiaChat";
import CameraTools from "@/components/CameraTools";
import { GridPattern } from "@/components/ui/GridPattern";
import { MessageSquare, Camera, Smile, Activity } from "lucide-react";

export default function Agent() {
    const [activeSection, setActiveSection] = useState<'chat' | 'detection'>('detection');
    const [cameraTab, setCameraTab] = useState<'mood' | 'posture'>('mood');

    return (
        <div className="min-h-screen bg-zinc-950 relative">
            <GridPattern />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                        <span className="text-orange-500">Ria</span> Agent Panel
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Real-time mood and posture detection with AI chat assistant
                    </p>
                </div>

                {/* Section Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveSection('detection')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeSection === 'detection'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                    >
                        <Camera className="w-5 h-5" />
                        Live Detection
                    </button>
                    <button
                        onClick={() => setActiveSection('chat')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            activeSection === 'chat'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        Chat with Ria
                    </button>
                </div>

                {/* Detection Section - Full Screen */}
                {activeSection === 'detection' && (
                    <div className="w-full">
                        <CameraTools
                            activeTab={cameraTab}
                            setActiveTab={setCameraTab}
                        />
                    </div>
                )}

                {/* Chat Section */}
                {activeSection === 'chat' && (
                    <div className="max-w-4xl mx-auto">
                        <RiaChat />
                    </div>
                )}
            </div>
        </div>
    );
}
