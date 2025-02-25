"use client"

import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import VerificationStart from "@/app/components/verification-start";
import VerificationConfirm from "@/app/components/verification-confirm";
import DocumentCapture from "@/app/components/document-capture";
import { ComponentState } from "@/app/helper/custom-types";

const DocumentCaptureMemo = React.memo(DocumentCapture); // Explicit memoization

export default function Home() {
    const wsRef = useRef<WebSocket | null>(null);
    const [currentComponent, setNextComponent] = useState<ComponentState>('start');
    const [invalidToken, setInvalidToken] = useState(false);
    const [wsReady, setWsReady] = useState(false);
    const [isSelfie, setIsSelfie] = useState(false);
    const params = useParams();
    const token = (params?.token as string) ?? '';

    const ws_url = process.env.NEXT_PUBLIC_WS_URL || 'wss://localhost:8443/video-stream';

    const connectWebSocket = useMemo(() => {
        return () => {
            return new Promise<void>((resolve, reject) => {
                if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
                    console.debug('WebSocket already connected');
                    resolve();
                    return;
                }

                wsRef.current = new WebSocket(ws_url);

                wsRef.current.onopen = () => {
                    console.debug('WebSocket connected');
                    if (token) {
                        wsRef.current?.send(JSON.stringify({ action: 'authenticate', token }));
                    } else {
                        console.error('No token provided for authentication');
                        wsRef.current?.close(1000, 'No token');
                        reject(new Error('No token'));
                    }
                    resolve();
                };

                wsRef.current.onmessage = (event) => {
                    console.debug('WebSocket raw message:', event.data);
                    try {
                        const data = JSON.parse(event.data);
                        if (data.status === 'success' && data.message === 'authenticated') {
                            console.debug('WebSocket token authenticated');
                            setWsReady(true);
                            setInvalidToken(false);
                        } else {
                            setInvalidToken(true);
                        }
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                wsRef.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setWsReady(false);
                    reject(error);
                };

                wsRef.current.onclose = (event) => {
                    console.debug('WebSocket closed:', event.code, event.reason);
                    setWsReady(false);
                    if (!event.wasClean && !invalidToken) {
                        console.debug('Attempting to reconnect...');
                        setTimeout(() => connectWebSocket(), 3000);
                    }
                };
            });
        };
    }, [ws_url, token]);

    useEffect(() => {
        connectWebSocket().catch(() => console.error('Initial WebSocket connection failed'));
        return () => {
            wsRef.current?.close(1000, 'Page closed');
        };
    }, [connectWebSocket]);

    const renderContent = useMemo(() => {
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
        }

        return (
            <div>
                {currentComponent === 'start' && <VerificationStart token={token} setNextComponent={setNextComponent} />}
                {currentComponent === 'confirm' && <VerificationConfirm setNextComponent={setNextComponent} />}
                {currentComponent === 'document' && (
                    <DocumentCaptureMemo
                        wsRef={wsRef}
                        wsReady={wsReady}
                        connectWebSocket={connectWebSocket}
                        isSelfie={isSelfie}
                        setIsSelfie={setIsSelfie}
                    />
                )}
            </div>
        );
    }, [token, invalidToken, currentComponent, setNextComponent, wsRef, wsReady, connectWebSocket, isSelfie, setIsSelfie]);

    return renderContent;
}