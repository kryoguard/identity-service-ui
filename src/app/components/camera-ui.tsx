import React from "react";
import { X, Camera } from "lucide-react";
import AnimatedShield from "@/app/helper/animatedShield";

interface CameraUIProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isProcessing: boolean;
    error: string | null;
    captureAndProcess: () => Promise<void>;
    KryoLogo: React.ComponentType<{ className?: string }>;
    isSelfie: boolean;
    facingMode: 'environment' | 'user';
}

const CameraUI: React.FC<CameraUIProps> = ({
    videoRef, canvasRef, isProcessing, error, captureAndProcess, KryoLogo, isSelfie, facingMode
}) => {
    const handleCaptureAndProcess = async () => {
        try {
            await captureAndProcess();
        } catch (error) {
            console.error('Capture failed:', error);
        }
    };
    return (
        <div className="relative w-full h-full sm:h-screen flex flex-col items-center justify-center px-4 sm:px-0">
            {/* Header - Only shown on desktop */}
            <div className="hidden sm:flex justify-between items-center w-full max-w-2xl mx-auto mb-6">
                <div className="w-6" />
                <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-semibold text-blue-500">
                        KryoGuard
                    </span>
                    <KryoLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
            </div>

            {/* Instructions - Desktop Only */}
            <div className="hidden sm:block text-center space-y-2 mb-4">
                <h1 className="text-2xl font-semibold text-gray-700">
                    Take a picture of your document&apos;s photo page
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                    Please use any of these: passport, ID card, driver&apos;s license, or residence permit.
                </p>
            </div>

            {/* Main Camera Container */}
            <div className="relative w-full h-full sm:max-w-2xl sm:h-auto mx-auto flex justify-center">
                {/* Camera View */}
                <div className="relative w-full h-full sm:h-auto sm:aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover sm:h-auto sm:aspect-video object-cover ${ facingMode === 'user' ? 'transform scale-x-[-1]' : '' }`}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Frame Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {isSelfie ? (
                            <div className="border-4 border-white rounded-full w-5/6 sm:w-1/2 aspect-square opacity-75 relative
                            animate-[appear_0.5s_ease-out] transition-all"
                                style={{
                                    animation: 'appear 1.5s ease-out'
                                }}
                            >
                                <div className="absolute top-0 left-0 w-6 h-6 rounded-tl-full border-t-4 border-l-4 border-blue-400 
                                animate-[corner_0.3s_ease-out_0.5s] opacity-0 transform scale-0"
                                    style={{ animationFillMode: 'forwards' }} />
                                <div className="absolute top-0 right-0 w-6 h-6 rounded-tr-full border-t-4 border-r-4 border-blue-400 
                                animate-[corner_0.3s_ease-out_0.6s] opacity-0 transform scale-0"
                                    style={{ animationFillMode: 'forwards' }} />
                                <div className="absolute bottom-0 left-0 w-6 h-6 rounded-bl-full border-b-4 border-l-4 border-blue-400 
                                animate-[corner_0.3s_ease-out_0.7s] opacity-0 transform scale-0"
                                    style={{ animationFillMode: 'forwards' }} />
                                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-br-full border-b-4 border-r-4 border-blue-400 
                                animate-[corner_0.3s_ease-out_0.8s] opacity-0 transform scale-0"
                                    style={{ animationFillMode: 'forwards' }} />
                            </div>
                        ) : (
                            <div className="border-4 border-white rounded-lg w-11/12 sm:w-4/5 h-4/5 opacity-75">
                                <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-lg border-t-4 border-l-4 border-blue-400" />
                                <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg border-t-4 border-r-4 border-blue-400" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-lg border-b-4 border-l-4 border-blue-400" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-lg border-b-4 border-r-4 border-blue-400" />
                            </div>
                        )}


                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Capture Button - Positioned at Bottom for Mobile */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center sm:relative sm:mt-6">
                <button
                    onClick={handleCaptureAndProcess}
                    disabled={isProcessing}
                    className={`
                flex items-center justify-center gap-2 
                px-6 py-3 rounded-full text-white
                ${isProcessing ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}
                shadow-lg transition-transform active:scale-95
              `}
                >
                    <Camera className="w-5 h-5" />
                    <span className="font-medium">
                        {isProcessing ? "Processing..." : "Capture"}
                    </span>
                </button>
            </div>

            {/* Processing Overlay */}
            <AnimatedShield
                isProcessing={isProcessing}
                animationType="ripple"
                size={200}
            />
        </div>
    );
};

export default CameraUI;
