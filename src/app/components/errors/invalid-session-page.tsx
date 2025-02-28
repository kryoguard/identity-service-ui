"use client";

import { AlertTriangle } from "lucide-react";
import KryoLogo from "@/app/assets/kryoLogo";

export default function InvalidSession() {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-between p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-20 z-50 overflow-y-auto">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Error Icon */}
        <div className="text-red-600">
          <AlertTriangle size={64} className="sm:w-20 sm:h-20 lg:w-24 lg:h-24" />
        </div>

        {/* Error Message */}
        <div className="text-center space-y-4 sm:space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-200">
            Invalid or Missing Session
          </h1>
          <p className="text-gray-200 max-w-md sm:max-w-lg mx-auto px-4 sm:px-0 text-lg sm:text-xl lg:text-2xl">
            Please provide a valid session to proceed.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
        <div className="flex items-center justify-center">
          <span>Powered by KryoGuard</span>
          <KryoLogo className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
        </div>
      </div>
    </div>
  );
}