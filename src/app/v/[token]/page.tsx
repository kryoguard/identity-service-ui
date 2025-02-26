// Home.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import VerificationStart from "@/app/components/verification-start";
import VerificationConfirm from "@/app/components/verification-confirm";
import DocumentCapture from "@/app/components/document-capture";
import { useWebSocket } from "@/app/helper/hook/useWebSocket";
import { ComponentState } from "@/app/helper/types/custom-types";

const DocumentCaptureMemo = React.memo(DocumentCapture);

export default function Home() {
    const params = useParams();
    const token = (params?.token as string) ?? "";
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://localhost:8443/video-stream";
    const { ws, isReady, isInvalidToken, connect } = useWebSocket(wsUrl, token);

    const wsRef = useRef<WebSocket | null>(null);
    const [currentComponent, setNextComponent] = useState<ComponentState>("start");
    const [isSelfie, setIsSelfie] = useState(false);

    wsRef.current = ws; // Sync ref with hook state

    const renderContent = useMemo(() => {
        if (!token || isInvalidToken) {
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
                {currentComponent === "start" && (
                    <VerificationStart token={token} setNextComponent={setNextComponent} />
                )}
                {currentComponent === "confirm" && <VerificationConfirm setNextComponent={setNextComponent} />}
                {currentComponent === "document" && (
                    <DocumentCaptureMemo
                        wsRef={wsRef}
                        wsReady={isReady}
                        connectWebSocket={connect}
                        isSelfie={isSelfie}
                        setIsSelfie={setIsSelfie}
                    />
                )}
            </div>
        );
    }, [token, isInvalidToken, currentComponent, isReady, isSelfie]);

    return renderContent;
}