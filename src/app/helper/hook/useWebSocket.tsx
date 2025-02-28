// hooks/useWebSocket.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketMessage } from "@/app/helper/types/custom-types";
import { AppError } from "@/app/helper/utils/errorHandler";

export function useWebSocket(wsUrl: string, token: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  const handleMessage = useCallback((data: WebSocketMessage) => {
    console.debug("WebSocket message:", data);
    if (data.status === "success" && data.message === "authenticated") {
      setIsReady(true);
      setIsInvalidToken(false);
    } else if (data.status === "error" && data.message === "authentication failed") {
      setIsInvalidToken(true);
    }
  }, []);

  const connect = useCallback(() => {
    console.log("Connecting to WebSocket:", wsUrl);
    return new Promise<void>((resolve, reject) => {
      console.debug(`WebSocket state: ${wsRef.current?.readyState}`);
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        resolve();
        return;
      }

      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        console.debug("WebSocket connected");
        if (token) {
          wsRef.current?.send(JSON.stringify({ action: "authenticate", token }));
        } else {
          wsRef.current?.close(1000, "No token");
          reject(new AppError(401,"No token"));
        }
        resolve();
      };
      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      wsRef.current.onerror =  reject;//(new AppError(500,`WebSocket error: Unable to connect to server ${wsUrl}`));
      wsRef.current.onclose = (event) => {
        setIsReady(false);
        if (!event.wasClean && !isInvalidToken) {
          // setTimeout(() => connect(), 3000);
        }
      };
    });
  }, [wsUrl, token, isInvalidToken, handleMessage]);

  useEffect(() => {
    connect().catch(console.error);
    return () => wsRef.current?.close(1000, "Page closed");
  }, [connect]);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { ws: wsRef.current, isReady, isInvalidToken, connect, sendMessage };
}