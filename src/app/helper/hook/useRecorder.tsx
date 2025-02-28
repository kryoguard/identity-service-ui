import { useCallback, useRef, useEffect } from "react";

export function useRecorder(stream: MediaStream | null, ws: WebSocket | null, isWsReady: boolean) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const getSupportedMimeType = useCallback(() => {
    const mimeTypes = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=h264,opus",
      "video/mp4;codecs=h264,aac",
      "video/mp4",
      "video/webm",
    ];
    return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || null;
  }, []);

  const startRecording = useCallback(() => {
    console.debug("Starting recording initiated...");
    console.debug(`isWsReady: ${isWsReady}, ws state: ${ws?.readyState}, stream available: ${!!stream}, stream tracks: ${stream?.getTracks().length || 0}`);
    if (!stream || !ws || !isWsReady || ws.readyState !== WebSocket.OPEN) {
      console.debug("Recording not started: preconditions not met");
      return;
    }

    const mimeType = getSupportedMimeType();
    console.debug(`Supported mimeType: ${mimeType}`);
    if (!mimeType) {
      console.debug("Recording not started: no supported mimeType");
      return;
    }

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current.ondataavailable = (event) => {
      console.debug(`MediaRecorder data available: ${event.data.size} bytes, state: ${mediaRecorderRef.current?.state}, ws state: ${ws.readyState}`);
      if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
        ws.send(event.data);
        console.debug("Sent video chunk to WebSocket");
      }
    };
    mediaRecorderRef.current.onstop = () => console.debug("MediaRecorder stopped");
    mediaRecorderRef.current.start(250);
    console.debug("Recording started");
  }, [stream, ws, isWsReady, getSupportedMimeType]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  // Auto-start recording when stream becomes available
  useEffect(() => {
    if (stream && isWsReady && ws?.readyState === WebSocket.OPEN) {
      startRecording();
    }
  }, [stream, isWsReady, ws, startRecording]);

  return { startRecording, stopRecording };
}