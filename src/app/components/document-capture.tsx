import React, { useCallback, useEffect, useRef, useState } from 'react';
import KryoLogo from '../KryoLogo';
// import { createWorker, PSM } from 'tesseract.js';
import { analyzeWithTextract, detectFace } from '../helper/awssdk-services';
import InvalidDocument from './errors/invalid-document';
import CameraUI from './camera-ui';

const DocumentCapture = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isSelfie, setIsSelfie] = useState(false);
    const [capturedImageStr, setCapturedImage] = useState('');
    // const [selfieImages, setSelfieImages] = useState<Uint8Array>(new Uint8Array());
    // const [documentImages, setDocumentImages] = useState<Uint8Array>(new Uint8Array());
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

    const ws_url = process.env.WS_URL || 'wss://localhost:8443/video-stream';
    // const api_base_url = process.env.NEXT_PUBLIC_URL || 'https://localhost:3000';

    const connectWebSocket = useCallback(() => {
        try {
            wsRef.current = new WebSocket(ws_url);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                // Create MediaRecorder only after WebSocket is connected
                if (videoRef.current?.srcObject) {
                    mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject as MediaStream, {
                        mimeType: 'video/webm;codecs=vp8,opus'
                    });

                    mediaRecorderRef.current.ondataavailable = (event) => {
                        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                            wsRef.current.send(event.data);
                        }
                    };

                    mediaRecorderRef.current.start(1000);
                    setIsRecording(true);
                    console.log('Recording started');
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('Connection error occurred. Retrying...');
                // Don't stop streaming immediately, maybe try to reconnect
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket closed:', event.reason);
                setIsRecording(false);

                // Try to reconnect if closure wasn't intentional
                if (!event.wasClean) {
                    setTimeout(() => {
                        // console.log('Attempting to reconnect...');
                        // connectWebSocket();
                    }, 3000); // Wait 3 seconds before trying to reconnect
                }
            };

        } catch (err) {
            console.error('WebSocket connection error:', err);
            setError('Failed to establish connection');
        }
    }, [ws_url]);

    const startStreaming = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Only connect WebSocket after we have the stream
                connectWebSocket();
            }

        } catch (err) {
            if (err instanceof Error) {
                setError('Error accessing camera: ' + err.message);
            } else {
                setError('Error accessing camera');
            }
        }
    }, [facingMode, connectWebSocket]);

    useEffect(() => {
        startStreaming();
        setIsProcessing(false);

        console.log('isRecording:', isRecording);

        // Cleanup function to stop everything when component unmounts
        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting'); // Clean closure
            }
            const videoElement = videoRef.current;
            if (videoElement) {
                const srcObject = videoElement.srcObject;
                if (srcObject) {
                    const tracks = (srcObject as MediaStream).getTracks();
                    tracks.forEach(track => track.stop());
                    videoElement.srcObject = null;
                }
            }
        };
    }, [facingMode, isRecording, startStreaming]);

    const toggleCamera = async () => {
        // Stop current stream
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }

        setIsSelfie(!isSelfie);
        setFacingMode(facingMode === 'environment' ? 'user' : 'environment');

        // Start new stream
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });

        if (videoRef.current) {
            videoRef.current.srcObject = newStream;
        }
    };

    const reset = () => {
        setError('');
        setHasError(false);
        setIsProcessing(false);
        startStreaming();
    }
    const stopStreaming = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
        // if (videoRef.current && videoRef.current.srcObject) {
        //     (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        //     videoRef.current.srcObject = null;
        // }
        setIsRecording(false);
    };

    const captureAndProcess = async () => {

        if (!videoRef.current || !canvasRef.current) {
            setError('Camera or OCR not initialized');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Get the frame dimensions from the video element
            const { videoWidth, videoHeight } = videoRef.current;

            // Set canvas dimensions to match video
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            // Draw the current frame to canvas
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
                setCapturedImage(canvasRef.current.toDataURL('image/png'));
            } else {
                throw new Error('Failed to get canvas context');
            }

            const imageBytes = await new Promise<Uint8Array>((resolve, reject) => {
                canvasRef.current?.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create blob from canvas'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                        if (!reader.result) {
                            reject(new Error('Failed to read blob'));
                            return;
                        }

                        const imageBytes = new Uint8Array(reader.result as ArrayBuffer);
                        resolve(imageBytes);
                    };
                    reader.onerror = () => {
                        reject(new Error('Error reading blob'));
                    };

                    reader.readAsArrayBuffer(blob);
                }, 'image/png', 0.9);
            });

            if (!isSelfie) {
                // setSelfieImages(imageBytes);

                // Process with Textract
                const result = await analyzeWithTextract(imageBytes);
                console.log('result', result);

                if (result.data.status.code === 0) {
                    switch (result.data.status.nextStep) {
                        case 'SELFIE_CAPTURE':
                            setIsSelfie(true);
                            toggleCamera();
                            break;
                        default:
                            setError('Unsupported document type');
                            setHasError(true);
                            stopStreaming();
                            break;
                    }

                } else {
                    setError(result.data.status.message);
                    setHasError(true);
                    stopStreaming();
                }
            } else {//selfie
                // setDocumentImages(imageBytes);

                const faceData = await detectFace(imageBytes);
                console.log('faceData', faceData);

                if (faceData.status.code === 0) {

                } else {
                    setError(faceData.status.message);
                    setHasError(true);
                    stopStreaming();
                }
            }


        } catch (err) {
            if (err instanceof Error) {
                setError('Error processing image: ' + err.message);
            } else {
                setError('Error processing image');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl mx-auto my-4 p-4 sm:p-6">
                {hasError ? (<InvalidDocument capturedImage={capturedImageStr} reset={reset} isSelfie erroMsg={error} />) : (
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
};

export default DocumentCapture;