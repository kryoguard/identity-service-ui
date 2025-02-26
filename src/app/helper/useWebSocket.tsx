// useWebSocket.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface WebSocketState {
    ws: WebSocket | null;
    isReady: boolean;
    isInvalidToken: boolean;
}

interface WebSocketMessage {
    status: "success" | "error";
    message: string;
}

export function useWebSocket(wsUrl: string, token: string): WebSocketState & {
    connect: () => Promise<void>;
} {
    const wsRef = useRef<WebSocket | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isInvalidToken, setIsInvalidToken] = useState(false);

    const connect = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
                console.debug("WebSocket already connected");
                resolve();
                return;
            }

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.debug("WebSocket connected");
                if (token) {
                    wsRef.current?.send(JSON.stringify({ action: "authenticate", token }));
                } else {
                    console.error("No token provided for authentication");
                    wsRef.current?.close(1000, "No token");
                    reject(new Error("No token"));
                }
                resolve();
            };

            wsRef.current.onmessage = (event) => {
                console.debug("WebSocket raw message:", event.data);
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    if (data.status === "success" && data.message === "authenticated") {
                        console.debug("WebSocket token authenticated");
                        setIsReady(true);
                        setIsInvalidToken(false);
                    } else if (data.status === "error" && data.message === "authentication failed") {
                        console.error("Invalid token provided");
                        setIsInvalidToken(true);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                setIsReady(false);
                reject(error);
            };

            wsRef.current.onclose = (event) => {
                console.debug("WebSocket closed:", event.code, event.reason);
                setIsReady(false);
                if (!event.wasClean && !isInvalidToken) {
                    console.debug("Attempting to reconnect...");
                    setTimeout(() => connect(), 3000);
                }
            };
        });
    }, [wsUrl, token, isInvalidToken]);

    useEffect(() => {
        connect().catch(() => console.error("Initial WebSocket connection failed"));
        return () => {
            wsRef.current?.close(1000, "Page closed");
        };
    }, [connect]);

    return { ws: wsRef.current, isReady, isInvalidToken, connect };
}