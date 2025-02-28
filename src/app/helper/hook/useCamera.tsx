import { useCallback, useRef, useState } from "react";

export function useCamera(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const streamRef = useRef<MediaStream | null>(null);
  const [streamState, setStreamState] = useState<MediaStream | null>(null); // Added state for stream
  const [isStreamActive, setIsStreamActive] = useState(false);

  const startCamera = useCallback(async (newFacingMode?: "environment" | "user") => {
    if (!videoRef.current) {
      console.debug(`startCamera: Video element not available ${videoRef.current}`);
      throw new Error("Video element not available");
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
      setStreamState(null); // Clear state
    }

    const facing = newFacingMode || facingMode;
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      videoRef.current.srcObject = streamRef.current;
      setStreamState(streamRef.current); // Update state to trigger re-render
      setIsStreamActive(true);
      console.debug("Camera started, stream active");
      return streamRef.current;
    } catch (err) {
      throw new Error("Error accessing camera: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }, [facingMode, videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStreamState(null); // Update state
      setIsStreamActive(false);
      console.debug("Camera stopped");
    }
  }, [videoRef]);

  const toggleCamera = useCallback(async () => {
    stopCamera();
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    await startCamera(newFacingMode);
  }, [facingMode, startCamera, stopCamera]);

  return { startCamera, stopCamera, toggleCamera, facingMode, stream: streamState, isStreamActive }; // Return state instead of ref
}