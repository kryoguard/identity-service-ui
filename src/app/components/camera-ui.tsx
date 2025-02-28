import React from "react";
import AnimatedShield from "@/app/helper/animatedShield";
import { CameraOverlay } from "@/app/components/CameraOverlay";
import { CaptureButton } from "@/app/components/CaptureButton";

interface CameraUIProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isProcessing: boolean;
  error: string | null;
  captureAndProcess: () => Promise<void>;
  KryoLogo: React.ComponentType<{ className?: string }>;
  isSelfie: boolean;
  facingMode: "environment" | "user";
}

const CameraUI: React.FC<CameraUIProps> = ({
  videoRef, canvasRef, isProcessing, error, captureAndProcess, isSelfie, facingMode
}) => (
  <div className="relative w-full h-full flex flex-col items-center sm:p-4 lg:p-6">
    {/* Video Container */}
    <div className="relative w-full h-full bg-black sm:rounded-2xl sm:shadow-2xl sm:max-w-3xl sm:h-auto sm:aspect-video lg:max-w-4xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover sm:h-auto sm:aspect-video ${facingMode === "user" ? "transform scale-x-[-1]" : ""}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      <CameraOverlay isSelfie={isSelfie} />

      {/* Capture Button - Overlay on Mobile, Below on Desktop */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center sm:static sm:mt-6 sm:mb-6">
        <CaptureButton isProcessing={isProcessing} onClick={captureAndProcess} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-8 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm sm:text-base shadow-md max-w-md mx-auto text-center sm:top-6 sm:max-w-lg">
          {error}
        </div>
      )}

      {/* Processing Overlay */}
      <AnimatedShield
        isProcessing={isProcessing}
        animationType="ripple"
        size={200}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      />
    </div>
  </div>
);

export default CameraUI;