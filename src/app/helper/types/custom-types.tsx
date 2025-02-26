export type ComponentState = 'start' | 'confirm' | 'document';

export interface CapturedImage {
    src: string;
    width: number;
    height: number;
}

export interface BaseData {
    status: {
        code: number;
        message: string;
        nextStep: string;
    }
}
export interface Data extends BaseData {
    documentType?: string;
    dateOfBirth?: string;
    gender?: string;
    dateOfIssue?: string;
    dateOfExpiry?: string;
}

export interface PassportData extends Data {
    type?: string;
    countryCode?: string;
    passportNumber?: string;
    surname?: string;
    givenNames?: string;
    nationality?: string;
    previousPassportNumber?: string;
    nin?: string;
    placeOfBirth?: string;
    authority?: string;
    mrz?: string;
}

export interface Country {
    id: string;
    name: string;
    phoneCode: string;
    iso: string;
}

export interface TextractConfig {
    region: string;
    identityPoolId: string;
}

export interface TextractResponse {
    data: Data;
    rawText: string
}

export interface FaceDetectResponse extends BaseData {
    faceDetails: unknown;
}

export interface MediaRecorderOptions {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    ws: WebSocket | null;
    isWsReady: boolean;
    onError: (message: string) => void;
}

export interface WebSocketState {
    ws: WebSocket | null;
    isReady: boolean;
    isInvalidToken: boolean;
}

export interface WebSocketMessage {
    status: "success" | "error";
    message: string;
}

export interface InvalidDocumentProps {
    capturedImage: { src: string; width: number; height: number };
    reset: () => void;
    isSelfie: boolean;
    erroMsg?: string;
}

export interface AnimatedShieldProps {
  size?: number;
  backgroundColor?: string;
  strokeColor?: string;
  innerColor?: string;
  centerColor?: string;
  pulseSpeed?: string;
  spinSpeed?: string;
  glowIntensity?: string;
  isAnimating?: boolean;
  animationType?: 'pulse' | 'rotate' | 'bounce' | 'glow' | 'ripple';
  isInteractive?: boolean;
  isProcessing?: boolean;
  onClick?: () => void;
  className?: string;
}