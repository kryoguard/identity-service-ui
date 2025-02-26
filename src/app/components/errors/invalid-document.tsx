import KryoLogo from "@/app/assets/kryoLogo";
import { Check, X } from "lucide-react";
import Image from "next/image";

interface InvalidDocumentProps {
    capturedImage: { src: string; width: number; height: number };
    reset: () => void;
    isSelfie: boolean;
    erroMsg?: string;
}

const InvalidDocument: React.FC<InvalidDocumentProps> = ({ capturedImage, reset, isSelfie, erroMsg }) => {
    console.log("Error Message from InvalidDocument:", erroMsg);
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div className="w-6" />
                <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-semibold text-blue-500">KryoGuard</span>
                    <KryoLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
            </div>
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-semibold text-gray-600">
                    {isSelfie ? "Poor Selfie Quality" : "Document Text Unclear"}
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto bg-red-100 p-4 rounded-md">
                    {isSelfie
                        ? erroMsg
                        : erroMsg === "Unsupported document type" ?
                            "This type of document isn't currently supported. Please use a valid passport or national ID card."
                            : "Make sure the text on the document is clear and readable. Avoid any glare or shadows that might obscure the text."}
                </p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-4">
                <div className="relative w-full max-w-2xl aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                        src={capturedImage.src}
                        alt="Captured"
                        width={capturedImage.width}
                        height={capturedImage.height}
                        className="w-full h-full object-cover"
                        unoptimized // Skip optimization for base64
                    />
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={reset}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        <Check className="w-5 h-5" />
                        <span>Try Again</span>
                    </button>
                </div>
            </div>
            <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 mt-4">
                Experiencing problems?
            </div>
        </>
    );
};

export default InvalidDocument;