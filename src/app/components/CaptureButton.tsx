import React from "react";
import { Camera } from "lucide-react";

interface CaptureButtonProps {
  isProcessing: boolean;
  onClick: () => Promise<void>;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({ isProcessing, onClick }) => (
  <button
    onClick={onClick}
    disabled={isProcessing}
    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white ${isProcessing ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} shadow-lg transition-transform active:scale-95`}
  >
    <Camera className="w-5 h-5" />
    <span className="font-medium">{isProcessing ? "Processing..." : "Capture"}</span>
  </button>
);