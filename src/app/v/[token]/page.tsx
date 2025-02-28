"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import VerificationStart from "@/app/components/verification-start";
import VerificationConfirm from "@/app/components/verification-confirm";
import DocumentCapture from "@/app/components/document-capture";
import { useWebSocket } from "@/app/helper/hook/useWebSocket";
import { useCamera } from "@/app/helper/hook/useCamera";
import { useRecorder } from "@/app/helper/hook/useRecorder";
import { ComponentState } from "@/app/helper/types/custom-types";
import InvalidSession from "@/app/components/errors/invalid-session-page";

const DocumentCaptureMemo = React.memo(DocumentCapture);

export default function Home() {
  const params = useParams();
  const token = (params?.token as string) ?? "";
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/video-stream";
  const { ws, isReady, isInvalidToken, connect, sendMessage } = useWebSocket(wsUrl, token);

  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentComponent, setNextComponent] = useState<ComponentState>("start");
  const [isSelfie, setIsSelfie] = useState(false);

  const { startCamera, stopCamera, toggleCamera, facingMode, stream, isStreamActive } = useCamera(videoRef);
  const { startRecording, stopRecording } = useRecorder(stream, ws, isReady);

  wsRef.current = ws;

  const initializeCameraAndRecording = useCallback(async () => {
    console.debug("Home initializing camera and recording");
    try {
      await startCamera(); // Start camera, updates stream state
      // Recording handled by useRecorder's useEffect
    } catch (err) {
      console.error("Failed to initialize camera in Home:", err);
    }
  }, [startCamera]);

  const stopCameraAndRecording = useCallback(() => {
    console.debug("Home stopping camera and recording");
    stopRecording();
    stopCamera();
  }, [stopRecording, stopCamera]);

  useEffect(() => {
    console.debug("Home useEffect running", { currentComponent, isStreamActive });
    let isMounted = true;

    if (currentComponent === "document" && !isStreamActive && isMounted) {
      initializeCameraAndRecording();
    }

    return () => {
      isMounted = false;
      if (currentComponent !== "document") {
        stopCameraAndRecording();
      }
    };
  }, [currentComponent, isStreamActive, initializeCameraAndRecording, stopCameraAndRecording]);

  if (!token || isInvalidToken) {
    return <InvalidSession />;
  }

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
      {currentComponent === "start" && (
        <VerificationStart token={token} setNextComponent={setNextComponent} />
      )}
      {currentComponent === "confirm" && (
        <VerificationConfirm setNextComponent={setNextComponent} />
      )}
      {currentComponent === "document" && (
        <DocumentCaptureMemo
          connectWebSocket={connect}
          sendMessageSocket={sendMessage}
          isSelfie={isSelfie}
          setIsSelfie={setIsSelfie}
          videoRef={videoRef}
          startCamera={startCamera}
          stopCamera={stopCamera}
          startRecording={startRecording}
          stopRecording={stopRecording}
          toggleCamera={toggleCamera}
          facingMode={facingMode}
          stream={stream}
        />
      )}
    </div>
  );
}