import React from "react";

interface CameraOverlayProps {
    isSelfie: boolean;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ isSelfie }) => (
    <div className="absolute inset-0 flex items-center justify-center">
        {isSelfie ? (
            <div className="border-4 border-white rounded-full w-5/6 sm:w-1/2 aspect-square opacity-75 relative animate-[appear_0.5s_ease-out]">
                {/* Corner animations */}
                <div className="absolute top-0 left-0 w-6 h-6 rounded-tl-full border-t-4 border-l-4 border-blue-400 animate-[corner_0.3s_ease-out_0.5s] opacity-0 transform scale-0" style={{ animationFillMode: "forwards" }} />
                {/* Add other corners similarly */}
            </div>
        ) : (
            <div className="border-4 border-white rounded-lg w-11/12 sm:w-4/5 h-4/5 opacity-75">
                <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-lg border-t-4 border-l-4 border-blue-400" />
                {/* Add other corners */}
            </div>
        )}
    </div>
);