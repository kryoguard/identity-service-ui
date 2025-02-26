
import { useCallback, useRef, useState } from "react";
import { MediaRecorderOptions } from "@/app/helper/types/custom-types";

export function useMediaRecorder({ videoRef, ws, isWsReady, onError }: MediaRecorderOptions) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const isStreaming = useRef(false);
    const hasStarted = useRef(false);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

    const getSupportedMimeType = useCallback(() => {
        const mimeTypes = [
            "video/webm;codecs=vp8,opus",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=h264,opus",
            "video/mp4;codecs=h264,aac",
            "video/mp4",
            "video/webm",
        ];
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                console.debug(`Selected supported mimeType: ${mimeType}`);
                return mimeType;
            }
        }
        console.error("No supported mimeType found for MediaRecorder");
        return null;
    }, []);

    const startStreaming = useCallback(async (newFacingMode?: "environment" | "user") => {
        if (isStreaming.current || hasStarted.current) return;
        isStreaming.current = true;
        hasStarted.current = true;

        try {
            const facing = newFacingMode || facingMode;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true,
            });

            console.debug("Trying stream with facingMode:", facing);
            const videoTrack = stream.getVideoTracks()[0];
            console.debug("Active camera label:", videoTrack.label, "constraints:", videoTrack.getSettings());

            if (videoRef.current) {
                if (videoRef.current.srcObject) {
                    (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
                }
                videoRef.current.srcObject = stream;
                if (isWsReady && ws?.readyState === WebSocket.OPEN) {
                    startRecording();
                }
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            onError("Error accessing camera: " + (err instanceof Error ? err.message : "Unknown error"));
            isStreaming.current = false;
            hasStarted.current = false;
        }
    }, [facingMode, isWsReady, ws, videoRef, onError]);

    const startRecording = useCallback(() => {
        if (!videoRef.current?.srcObject || !ws || ws.readyState !== WebSocket.OPEN || !isWsReady) {
            onError("Connection or stream not ready");
            return;
        }

        const mimeType = getSupportedMimeType();
        if (!mimeType) {
            onError("No supported video format available");
            return;
        }

        mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject as MediaStream, { mimeType });
        mediaRecorderRef.current.ondataavailable = (event) => {
            console.debug("Data available:", event.data.size, "bytes, WebSocket state:", ws.readyState);
            if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                ws.send(event.data);
                console.debug("Sent video chunk to WebSocket");
            } else {
                console.warn("Skipping send: data size or WebSocket state invalid");
            }
        };
        mediaRecorderRef.current.onstop = () => console.debug("MediaRecorder stopped");
        mediaRecorderRef.current.start(250);
        console.debug("Recording started with mimeType:", mimeType);
    }, [ws, isWsReady, videoRef, getSupportedMimeType, onError]);

    const stopStreaming = useCallback(() => {
        if (mediaRecorderRef.current?.state !== "inactive") {
            mediaRecorderRef.current?.stop();
        }
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        isStreaming.current = false;
        hasStarted.current = false;
        console.debug("Stopped streaming, isStreaming reset, time:", Date.now());
    }, [videoRef]);

    const toggleCamera = useCallback(async () => {
        stopStreaming();
        const newFacingMode = facingMode === "environment" ? "user" : "environment";
        setFacingMode(newFacingMode);
        await startStreaming(newFacingMode);
    }, [facingMode, stopStreaming, startStreaming]);

    return { startStreaming, stopStreaming, startRecording, toggleCamera, facingMode };
}