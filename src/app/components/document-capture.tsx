import React, { useCallback, useEffect, useRef, useState } from 'react';
import KryoLogo from '../KryoLogo';
import { analyzeWithTextract, detectFace } from '../helper/awssdk-services';
import InvalidDocument from './errors/invalid-document';
import CameraUI from './camera-ui';

const DocumentCapture = ({ token }: { token: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(true); // Start as false
    const [hasError, setHasError] = useState(false);
    const [invalidToken, setInvalidToken] = useState(false);
    const [isSelfie, setIsSelfie] = useState(false);
    const [capturedImageStr, setCapturedImage] = useState('');
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

    const ws_url = process.env.NEXT_PUBLIC_WS_URL || 'wss://localhost:8443/video-stream';
    const idsm_url = process.env.NEXT_PUBLIC_IDSM_BASE_URL || 'http://localhost:8081/v1/session/verify';

    const connectWebSocket = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.debug('WebSocket already connected');
            console.debug('recording state', mediaRecorderRef?.current?.state);
            return;
        }

        wsRef.current = new WebSocket(ws_url);

        wsRef.current.onopen = () => {
            console.debug('WebSocket connected');

            if (token) {
                wsRef.current?.send(JSON.stringify({ action: 'authenticate', token: token }));
            } else {
                console.error('No token provided for authentication');
                setError('No token provided');
                wsRef.current?.close(1000, 'No token');
            }
        };

        wsRef.current.onmessage = (event) => {
            console.debug('WebSocket raw message:', event.data);
            try {
                const data = JSON.parse(event.data);
                if (data.status === 'success' && data.message === 'authenticated') {
                    console.debug('WebSocket token aunthenticated');
                    if (videoRef.current?.srcObject) {
                        startRecording(videoRef.current);
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                return;
            }
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Connection lost. retrying...');
        };

        wsRef.current.onclose = (event) => {
            console.debug('WebSocket closed:', event.code, event.reason);
            setIsRecording(false);
            if (!event.wasClean) {
                console.debug('Attempting to reconnect...');
                setTimeout(connectWebSocket, 3000);  // Reconnect after 3s
            }
        };
    }, [ws_url]);

    const startStreaming = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true,
            });
            console.debug('Media stream obtained:', stream);
            console.debug('Stream tracks:', stream.getTracks());
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                connectWebSocket(); // Connect WS after stream is ready
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Error accessing camera: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }

    }, [facingMode, connectWebSocket]);

    useEffect(() => {
        if (token) {
            fetch(`${idsm_url}/${token}`)
                .then(response => response.json())
                .then((data) => {
                    if (data.status === "success") {
                        setIsProcessing(false);
                        setInvalidToken(false);
                        startStreaming();
                    } else {
                        setInvalidToken(true);
                        setIsProcessing(false);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setInvalidToken(true);
                    setIsProcessing(false);
                });
        }

        return () => {
            // Cleanup only on unmount, not on every dependency change
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
                wsRef.current.close(1000, 'Component unmounting');
            }
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [startStreaming, token]); // Only depend on startStreaming, not isRecording or facingMode

    const toggleCamera = useCallback(async () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }

        const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newFacingMode);
        setIsSelfie(!isSelfie);

        await startStreaming(); // Restart stream with new facing mode
    }, [facingMode, isSelfie, startStreaming]);
    const startRecording = (currentVideoRef: HTMLVideoElement) => {
        if (!currentVideoRef.srcObject) {
            console.error('No video stream available for recording');
            return;
        }
        mediaRecorderRef.current = new MediaRecorder(currentVideoRef.srcObject as MediaStream, {
            mimeType: 'video/webm;codecs=vp8,opus',
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
            console.debug('Data available:', event.data.size, 'bytes, WebSocket state:', wsRef.current?.readyState);
            if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(event.data);
                console.debug('Sent video chunk to WebSocket');
            } else {
                console.warn('Skipping send: data size or WebSocket state invalid');
            }
        };

        mediaRecorderRef.current.onstop = () => {
            console.debug('MediaRecorder stopped');
            setIsRecording(false);
        };

        mediaRecorderRef.current.start(1000); // Send chunks every 1s
        setIsRecording(true);
        console.debug('Recording started', isRecording);
    }
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            console.debug('MediaRecorder stopped manually');
        }
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
            wsRef.current.close(1000, 'Manual stop');
            console.debug('WebSocket closed manually');
        }
        setIsRecording(false);
    };
    const reset = () => {
        setError('');
        setHasError(false);
        setIsProcessing(false);
        startStreaming();
    };
    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) {
            setError('Camera or canvas not initialized');
            return;
        }

        setIsProcessing(true);
        stopRecording();
        setError('');

        try {
            const { videoWidth, videoHeight } = videoRef.current;
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) { throw new Error('Failed to get canvas context') };

            ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
            setCapturedImage(canvasRef.current.toDataURL('image/png'));

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
                        startStreaming();
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
            setError('Error processing image: ' + (err instanceof Error ? err.message : 'Unknown error'));
            setHasError(true);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!token || invalidToken) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-4 p-4 sm:p-6">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-semibold text-gray-600">Invalid or missing session</h1>
                        <p className="text-gray-600 max-w-sm mx-auto bg-red-100 p-4 rounded-md">
                            Please provide a valid session to proceed
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-4 p-4 sm:p-6">
                    {hasError ? (
                        <InvalidDocument
                            capturedImage={capturedImageStr}
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
    }

};

export default DocumentCapture;