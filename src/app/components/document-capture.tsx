import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMediaRecorder } from "@/app/helper/hook/useMediaRecorder";
import { captureImage, processImage } from "@/app/helper/utils/imageUtils";
import InvalidDocument from "@/app/components/errors/invalid-document";
import CameraUI from "@/app/components/camera-ui";
import KryoLogo from "@/app/assets/kryoLogo";
import { CapturedImage } from "@/app/helper/types/custom-types";


interface DocumentCaptureProps {
    wsRef: React.RefObject<WebSocket | null>;
    wsReady: boolean;
    connectWebSocket: () => Promise<void>;
    isSelfie: boolean;
    setIsSelfie: React.Dispatch<React.SetStateAction<boolean>>;
}

const DocumentCapture: React.FC<DocumentCaptureProps> = React.memo(
    ({ wsRef, wsReady, connectWebSocket, isSelfie, setIsSelfie }) => {
        const videoRef = useRef<HTMLVideoElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [error, setError] = useState<string>("");
        const [isProcessing, setIsProcessing] = useState(false);
        const [hasError, setHasError] = useState(false);
        const [capturedImage, setCapturedImage] = useState<CapturedImage>({ src: "", width: 0, height: 0 });

        const { startStreaming, stopStreaming, toggleCamera } = useMediaRecorder({
            videoRef,
            ws: wsRef.current,
            isWsReady: wsReady,
            onError: setError,
        });

        useEffect(() => {
            console.debug("DocumentCapture mounted, time:", Date.now());
            const timer = setTimeout(() => startStreaming(), 300);
            return () => {
                console.debug("DocumentCapture unmounted, time:", Date.now());
                clearTimeout(timer);
                stopStreaming();
            };
        }, [startStreaming, stopStreaming]);

        const captureAndProcess = useCallback(async () => {
            setIsProcessing(true);
            try {
                const image = await captureImage(videoRef, canvasRef);
                setCapturedImage(image);
                const result = await processImage(image, isSelfie, async () => {
                    await connectWebSocket();
                    await toggleCamera();
                    setIsSelfie((prev) => !prev);
                });
                if (result.error) {
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
        }, [isSelfie, connectWebSocket, toggleCamera, setIsSelfie]);

        const reset = useCallback(() => {
            setError("");
            setHasError(false);
            setIsProcessing(false);
            setCapturedImage({ src: "", width: 0, height: 0 });
            stopStreaming();
            startStreaming();
        }, [stopStreaming, startStreaming]);

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-4 p-4 sm:p-6">
                    {hasError ? (
                        <InvalidDocument
                            capturedImage={capturedImage}
                            reset={reset}
                            isSelfie={isSelfie}
                            erroMsg={error}
                        />
                    ) : (
                        <CameraUI
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            isProcessing={isProcessing}
                            error={error}
                            captureAndProcess={captureAndProcess}
                            KryoLogo={KryoLogo}
                            isSelfie={isSelfie}
                            facingMode={"environment"} // Placeholder; adjust if needed
                        />
                    )}
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.wsRef === nextProps.wsRef &&
            prevProps.wsReady === nextProps.wsReady &&
            prevProps.connectWebSocket === nextProps.connectWebSocket &&
            prevProps.isSelfie === nextProps.isSelfie &&
            prevProps.setIsSelfie === nextProps.setIsSelfie
        );
    }
);

DocumentCapture.displayName = "DocumentCapture";
export default DocumentCapture;