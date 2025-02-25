import React, { useCallback, useEffect, useRef, useState } from 'react';
import KryoLogo from '../KryoLogo';
import { analyzeWithTextract, detectFace } from '../helper/awssdk-services';
import InvalidDocument from './errors/invalid-document';
import CameraUI from './camera-ui';

const DocumentCapture: React.FC<{
    wsRef: React.RefObject<WebSocket | null>;
    wsReady: boolean;
    connectWebSocket: () => Promise<void>;
    isSelfie: boolean;
    setIsSelfie: React.Dispatch<React.SetStateAction<boolean>>;
}> = React.memo(
    ({
        wsRef,
        wsReady,
        connectWebSocket,
        isSelfie,
        setIsSelfie,
    }) => {
        const videoRef = useRef<HTMLVideoElement>(null);
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const mediaRecorderRef = useRef<MediaRecorder | null>(null);
        const isStreaming = useRef(false);
        const streamingPromise = useRef<Promise<void> | null>(null);
        const hasStarted = useRef(false);
        const capturedImageRef = useRef<string>(''); // Temporary storage for captured image
        const [error, setError] = useState<string>('');
        const [isProcessing, setIsProcessing] = useState<boolean>(false);
        const [hasError, setHasError] = useState<boolean>(false);
        const [capturedImageStr, setCapturedImage] = useState<string>('');

        const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

        useEffect(() => {
            console.debug('DocumentCapture mounted, time:', Date.now());
            return () => {
                console.debug('DocumentCapture unmounted, time:', Date.now());
            };
        }, []);

        function getSupportedMimeType(): string | null {
            const mimeTypes = [
                'video/webm;codecs=vp8,opus',
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=h264,opus',
                'video/mp4;codecs=h264,aac',
                'video/mp4',
                'video/webm',
            ];

            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    console.debug(`Selected supported mimeType: ${mimeType}`);
                    return mimeType;
                }
            }

            console.error('No supported mimeType found for MediaRecorder');
            return null;
        }

        function stopRecording() {
            if (mediaRecorderRef.current?.state !== 'inactive') {
                mediaRecorderRef.current?.stop();
                console.debug('MediaRecorder stopped manually');
            }
            if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
                wsRef.current.close(1000, 'Recording stopped');
                wsRef.current = null;
            }
        }

        function stopStreaming() {
            if (mediaRecorderRef.current?.state !== 'inactive') {
                mediaRecorderRef.current?.stop();
            }
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            isStreaming.current = false;
            streamingPromise.current = null;
            console.debug('Stopped streaming, isStreaming reset, time:', Date.now());
        }

        function startRecording(currentVideoRef: HTMLVideoElement, restartStream: () => Promise<void>) {
            if (!currentVideoRef.srcObject) {
                console.error('No video stream available for recording');
                setError('No video stream available');
                return;
            }
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !wsReady) {
                console.error('WebSocket not ready for recording');
                setError('Connection not ready. Please try again.');
                return;
            }

            const mimeType = getSupportedMimeType();
            if (!mimeType) {
                setError('No supported video format available for recording on this device');
                return;
            }

            try {
                mediaRecorderRef.current = new MediaRecorder(currentVideoRef.srcObject as MediaStream, {
                    mimeType,
                });

                mediaRecorderRef.current.ondataavailable = (event) => {
                    console.debug('Data available:', event.data.size, 'bytes, WebSocket state:', wsRef.current?.readyState);
                    if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(event.data);
                        console.debug('Sent video chunk to WebSocket');
                    } else {
                        console.warn('Skipping send: data size or WebSocket state invalid');
                        if (wsRef.current?.readyState !== WebSocket.OPEN && !isProcessing && !hasError) {
                            console.debug('WebSocket closed unexpectedly, attempting to reconnect');
                            connectWebSocket().then(() => {
                                hasStarted.current = false;
                                restartStream();
                            });
                        }
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    console.debug('MediaRecorder stopped');
                };

                mediaRecorderRef.current.start(250); // 250ms chunks
                console.debug('Recording started with mimeType:', mimeType);
            } catch (err) {
                console.error('Failed to start MediaRecorder:', err);
                setError('Error starting recording: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
        }

        async function startStreaming(newFacingMode?: 'environment' | 'user') {
            console.debug('Attempting to start stream, isStreaming:', isStreaming.current, 'hasStarted:', hasStarted.current, 'time:', Date.now());
            if (isStreaming.current || hasStarted.current) {
                if (streamingPromise.current) {
                    console.debug('Awaiting existing streaming promise');
                    await streamingPromise.current;
                }
                return;
            }

            isStreaming.current = true;
            hasStarted.current = true;
            const streamPromise = (async () => {
                try {
                    const facing = newFacingMode || facingMode;
                    let stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: true,
                    });

                    try {
                        console.debug('Trying stream with facingMode:', facing);
                        const videoTrack = stream.getVideoTracks()[0];
                        console.debug('Active camera label:', videoTrack.label, 'constraints:', videoTrack.getSettings());
                    } catch (err) {
                        if (err instanceof OverconstrainedError) {
                            console.debug('OverconstrainedError detected, retrying with relaxed constraints');
                            stream = await navigator.mediaDevices.getUserMedia({
                                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                                audio: true,
                            });
                        } else {
                            throw err;
                        }
                    }

                    console.debug('Media stream obtained:', stream);
                    if (videoRef.current) {
                        if (videoRef.current.srcObject) {
                            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                        }
                        videoRef.current.srcObject = stream;
                        setIsProcessing(false);
                        const videoTrack = stream.getVideoTracks()[0];
                        console.debug('Active camera label:', videoTrack.label, 'constraints:', videoTrack.getSettings());
                        if (wsReady && videoRef.current) {
                            startRecording(videoRef.current, startStreaming);
                        }
                    }
                } catch (err) {
                    console.error('Error accessing camera:', err);
                    setError('Error accessing camera: ' + (err instanceof Error ? err.message : 'Unknown error'));
                    setHasError(true);
                    isStreaming.current = false;
                    hasStarted.current = false;
                    throw err;
                }
            })();

            streamingPromise.current = streamPromise;
            await streamPromise;
            streamingPromise.current = null;
            console.debug('Stream completed, lock persists until stop, time:', Date.now());
        }

        useEffect(() => {
            const timer = setTimeout(() => {
                startStreaming();
            }, 300);

            return () => {
                clearTimeout(timer);
                stopStreaming();
            };
        }, []);

        const toggleCamera = useCallback(async () => {
            stopStreaming();

            const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
            setFacingMode(newFacingMode);
            setIsSelfie(prev => {
                const newValue = !prev;
                console.log('Setting isSelfie to:', newValue);
                return newValue;
            });

            await connectWebSocket();
            await new Promise(resolve => setTimeout(resolve, 700));
            await startStreaming(newFacingMode);
        }, [facingMode, connectWebSocket, setIsSelfie]);

        const reset = useCallback(() => {
            setError('');
            setHasError(false);
            setIsProcessing(false);
            setCapturedImage(''); // Reset captured image
            capturedImageRef.current = ''; // Clear ref too
            stopStreaming();
            startStreaming();
        }, []);

        const captureAndProcess = useCallback(async () => {
            if (!videoRef.current || !canvasRef.current) {
                setError('Camera or canvas not initialized');
                return;
            }

            setIsProcessing(true);
            stopRecording();

            try {
                const { videoWidth, videoHeight } = videoRef.current;
                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;

                const ctx = canvasRef.current.getContext('2d');
                if (!ctx) throw new Error('Failed to get canvas context');

                ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
                const imageDataUrl = canvasRef.current.toDataURL('image/png');
                capturedImageRef.current = imageDataUrl; // Store in ref immediately
                setCapturedImage(imageDataUrl); // Update state
                console.debug('Captured image set:', imageDataUrl.substring(0, 50) + '...');

                const imageBytes = await new Promise<Uint8Array>((resolve, reject) => {
                    canvasRef.current?.toBlob(
                        (blob) => {
                            if (!blob) return reject(new Error('Failed to create blob'));
                            const reader = new FileReader();
                            reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
                            reader.onerror = () => reject(new Error('Error reading blob'));
                            reader.readAsArrayBuffer(blob);
                        },
                        'image/png',
                        0.9
                    );
                });

                if (!isSelfie) {
                    const result = await analyzeWithTextract(imageBytes);
                    console.debug('Textract result:', result);

                    if (result.data.status.code === 0) {
                        if (result.data.status.nextStep === 'SELFIE_CAPTURE') {
                            await toggleCamera();
                        }
                    } else {
                        setError(result.data.status.message);
                        setHasError(true);
                    }
                } else {
                    const faceData = await detectFace(imageBytes);
                    console.debug('Face detection result:', faceData);

                    if (faceData.status.code !== 0) {
                        setError(faceData.status.message);
                        setHasError(true);
                    }
                }
            } catch (err) {
                console.error('Error processing image:', err);
                setError('Error processing image: ' + (err instanceof Error ? err.message : 'Unknown error'));
                setHasError(true);
            } finally {
                setIsProcessing(false);
            }
        }, [isSelfie, toggleCamera]);

        useEffect(() => {
            console.log('isSelfie updated to:', isSelfie);
        }, [isSelfie]);

        // Debug capturedImageStr in render
        useEffect(() => {
            if (hasError) {
                console.debug('Rendering InvalidDocument with capturedImageStr:', capturedImageStr.substring(0, 50) + '...');
            }
        }, [hasError, capturedImageStr]);

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-4 p-4 sm:p-6">
                    {hasError ? (
                        <InvalidDocument
                            capturedImage={capturedImageStr || capturedImageRef.current} // Fallback to ref
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
                            facingMode={facingMode}
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

DocumentCapture.displayName = 'DocumentCapture';

export default DocumentCapture;