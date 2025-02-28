import React from "react";
import { X } from "lucide-react";
import SelfieImage from "@/app/assets/selfieImage";
import KryoLogo from "@/app/assets/kryoLogo";
import { ComponentState } from "@/app/helper/types/custom-types";

const VerificationConfirm = ({ setNextComponent }: { setNextComponent: (component: ComponentState) => void }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-20 z-50 overflow-y-auto">
      <div className="w-full max-w-md sm:max-w-3xl lg:max-w-4xl bg-white rounded-2xl shadow-2xl sm:p-6 sm:pt-12 lg:p-8 lg:pt-14 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
          <div className="w-6" />
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">KryoGuard</span>
            <KryoLogo className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
          </div>
          <button onClick={() => setNextComponent('start')} className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="text-center space-y-8 sm:space-y-8 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
            What to Expect Next
          </h1>
          <p className="text-gray-600 max-w-md sm:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-0 text-sm sm:text-base lg:text-lg">
            You’ll need to provide your ID and take a selfie. It’s a fast, secure process trusted by millions worldwide.
          </p>
        </div>

        {/* Illustration */}
        <div className="my-8 sm:my-8 lg:my-10 flex justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72">
            <SelfieImage />
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-8 sm:space-y-8 sm:mt-2">
          <p className="text-center text-sm sm:text-base lg:text-base text-gray-500 px-4 sm:px-6 lg:px-8 space-y-2">
            <span className="block">Your session may be recorded, including audio and video.</span>
            <span className="block">
              Learn more in our{' '}
              <button className="text-blue-600 hover:underline">
                Privacy Notice
              </button>
              .
            </span>
          </p>

          <button
            className="w-full bg-blue-600 text-white py-4 px-6 sm:py-3 sm:px-0 rounded-lg hover:bg-blue-700 transition-colors sm:text-lg lg:text-xl font-semibold shadow-md mb-4 sm:mb-0"
            onClick={() => setNextComponent("document")}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationConfirm;