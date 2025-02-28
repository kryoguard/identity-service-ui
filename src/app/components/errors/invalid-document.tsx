import React from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import { InvalidDocumentProps } from "@/app/helper/types/custom-types";
import { getErrorMessage } from "@/app/helper/utils/errorHandler";

// Reusable Header Component
const ErrorHeader: React.FC<{ isSelfie: boolean; erroMsg?: string }> = ({ isSelfie, erroMsg }) => (
  <>
    <div className="text-center space-y-3 sm:space-y-4">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-600">
        {isSelfie ? "Poor Selfie Quality" : "Document Text Unclear or Invalid"}
      </h1>
      <p className="text-gray-600 max-w-md sm:max-w-lg lg:max-w-xl mx-auto bg-red-100 p-3 sm:p-4 rounded-md text-sm sm:text-base lg:text-lg">
        {getErrorMessage(isSelfie, erroMsg)}
      </p>
    </div>
  </>
);

// Reusable Image Display Component
const CapturedImageDisplay: React.FC<{ capturedImage: InvalidDocumentProps["capturedImage"] }> = ({ capturedImage }) => (
  <div className="relative w-full max-w-md sm:max-w-3xl lg:max-w-4xl aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-md">
    <Image
      src={capturedImage.src}
      alt="Captured"
      width={capturedImage.width}
      height={capturedImage.height}
      className="w-full h-full object-cover"
      unoptimized
    />
  </div>
);

const InvalidDocument: React.FC<InvalidDocumentProps> = ({ capturedImage, reset, isSelfie, erroMsg }) => (
  <div className="w-full h-full sm:bg-white sm:rounded-2xl sm:shadow-2xl sm:max-w-3xl sm:h-auto lg:max-w-4xl sm:p-6 lg:p-8 flex flex-col items-center">
    <ErrorHeader isSelfie={isSelfie} erroMsg={erroMsg} />
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 p-4 sm:p-0">
      <CapturedImageDisplay capturedImage={capturedImage} />
      <div className="flex justify-center sm:mt-6 sm:mb-6">
        <button
          onClick={reset}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors sm:text-lg lg:text-xl"
        >
          <Check className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  </div>
);

export default InvalidDocument;