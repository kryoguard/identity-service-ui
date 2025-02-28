import React, { useCallback, useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { captureImage, processImage } from "@/app/helper/utils/imageUtils";
import InvalidDocument from "@/app/components/errors/invalid-document";
import CameraUI from "@/app/components/camera-ui";
import KryoLogo from "@/app/assets/kryoLogo";
import { CapturedImage } from "@/app/helper/types/custom-types";

interface DocumentCaptureProps {
  connectWebSocket: () => Promise<void>;
  sendMessageSocket: (message: Record<string, unknown>) => void;
  isSelfie: boolean;
  setIsSelfie: React.Dispatch<React.SetStateAction<boolean>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startCamera: (newFacingMode?: "environment" | "user" | undefined) => Promise<MediaStream | undefined>;
  stopCamera: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  toggleCamera: () => Promise<void>;
  facingMode: "environment" | "user";
  stream: MediaStream | null;
}

const DocumentCapture: React.FC<DocumentCaptureProps> = React.memo(
  ({
    connectWebSocket,
    sendMessageSocket,
    isSelfie,
    setIsSelfie,
    videoRef,
    startCamera,
    stopCamera,
    stopRecording,
    toggleCamera,
    facingMode,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [capturedImage, setCapturedImage] = useState<CapturedImage>({ src: "", width: 0, height: 0 });
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For debouncing

    const captureAndProcess = useCallback(async () => {
      setIsProcessing(true);
      try {
        const image = await captureImage(videoRef, canvasRef);
        setCapturedImage(image);
        const result = await processImage(image, isSelfie, async () => {
          sendMessageSocket({ action: "saveAudit" });
          await connectWebSocket();
          await toggleCamera();
          setIsSelfie((prev) => !prev);
        });
        if (result.error) {
          stopRecording();
          stopCamera();
          setError(result.error);
          setHasError(true);
        }
      } catch (err) {
        console.error("Error processing image:", err);
        setError("Error processing image: " + (err instanceof Error ? err.message : "Unknown error"));
        setHasError(true);
      } finally {
        setIsProcessing(false);
      }
    }, [isSelfie, connectWebSocket, toggleCamera, setIsSelfie, sendMessageSocket, videoRef, stopRecording, stopCamera]);

    const reset = useCallback(async () => {
      console.debug("DocumentCapture reset called");
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current); // Clear pending reset
      }

      // Debounce reset to prevent multiple rapid calls
      resetTimeoutRef.current = setTimeout(async () => {
        setError("");
        setHasError(false);
        setIsProcessing(false);
        setCapturedImage({ src: "", width: 0, height: 0 });
        await startCamera(facingMode); // Restart camera, Home.tsx handles recording
      }, 300); // 300ms debounce
    }, [startCamera, facingMode]);

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col sm:bg-black/80 sm:items-center sm:justify-center sm:p-4 sm:pt-16 lg:p-6 lg:pt-20 overflow-y-auto">
        <div className="hidden sm:flex w-full max-w-3xl lg:max-w-4xl items-center justify-between p-4 sm:p-6 bg-white rounded-t-2xl border-b border-gray-200 shadow-sm">
          <button className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">KryoGuard</span>
            <KryoLogo className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
          </div>
          <button className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="w-full h-full sm:max-w-3xl lg:max-w-4xl bg-white sm:rounded-b-2xl sm:shadow-2xl">
          <div style={{ display: hasError ? "none" : "block" }}>
            <CameraUI
              videoRef={videoRef}
              canvasRef={canvasRef}
              isProcessing={isProcessing}
              error={error}
              captureAndProcess={captureAndProcess}
              KryoLogo={KryoLogo}
              isSelfie={isSelfie}
              facingMode={facingMode}
            />
          </div>
          {hasError && (
            <InvalidDocument
              capturedImage={capturedImage}
              reset={reset}
              isSelfie={isSelfie}
              erroMsg={error}
            />
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.connectWebSocket === nextProps.connectWebSocket &&
      prevProps.sendMessageSocket === nextProps.sendMessageSocket &&
      prevProps.isSelfie === nextProps.isSelfie &&
      prevProps.setIsSelfie === nextProps.setIsSelfie &&
      prevProps.videoRef === nextProps.videoRef &&
      prevProps.toggleCamera === nextProps.toggleCamera &&
      prevProps.facingMode === nextProps.facingMode
    );
  }
);

DocumentCapture.displayName = "DocumentCapture";
export default DocumentCapture;