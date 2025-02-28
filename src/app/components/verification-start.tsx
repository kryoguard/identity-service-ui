"use client";

import { useState, useEffect } from "react";
import { Phone, QrCode, AlertCircle, ArrowRight, X, Info } from "lucide-react";
import QRCodeContainer from "@/app/helper/qrContainer";
import { ComponentState, Country } from "@/app/helper/types/custom-types";
import QRCodeGenerator from "@/app/helper/qrCodeGenerator";
import KryoLogo from "@/app/assets/kryoLogo";

export const VerificationStart = ({ token, setNextComponent }: { token: string; setNextComponent: (component: ComponentState) => void }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Canada (+1)");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activeTab, setActiveTab] = useState<"qr" | "sms">("qr");

  const currentURL = process.env.NEXT_PUBLIC_URL + "/v/" + token;
  const idsm_url = process.env.NEXT_PUBLIC_IDSM_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${idsm_url}/v1/system/country`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch countries");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [idsm_url]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-20 z-50 overflow-y-auto">
      <div className="relative w-full max-w-md lg:max-w-4xl bg-white rounded-2xl shadow-2xl sm:p-6 sm:pt-14 lg:p-8 lg:pt-16 flex flex-col">
        {/* Header with close button - fixed at top */}
        <div className="relative flex items-center justify-center p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">KryoGuard</span>
            <KryoLogo className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
          </div>
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-gray-700 p-1 touch-manipulation"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6">Complete Your Verification</h1>

            {/* Desktop layout with two columns */}
            <div className="lg:flex lg:space-x-8">
              {/* Left column for desktop */}
              <div className="lg:flex-1">
                {/* Tips section - now in left column on desktop */}
                <div className="bg-blue-50 rounded-lg py-6 sm:p-4 mb-4 sm:mb-6">
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base mb-3 px-4 sm:px-0">Verification Tips</h3>
                  <div className="space-y-4 sm:space-y-4 px-4 sm:px-0">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-md flex-shrink-0">
                        <AlertCircle size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">Please have a valid document ready</p>
                        <p className="text-xs sm:text-sm text-gray-600">Make sure it is valid and undamaged</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-md flex-shrink-0">
                        <Phone size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">Consider using a smartphone</p>
                        <p className="text-xs sm:text-sm text-gray-600">For better quality, consider using a smartphone</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What to expect section - additional content for desktop */}
                <div className="hidden lg:block bg-gray-50 rounded-lg py-6 sm:p-4 mb-6">
                  <h3 className="font-medium text-gray-800 text-base mb-2 px-4 sm:px-0">What to expect</h3>
                  <ul className="space-y-3 sm:space-y-3 text-sm text-gray-600 px-4 sm:px-0">
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">1</span>
                      <span>Document verification - Scan your ID document</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">2</span>
                      <span>Selfie verification - Take a photo of yourself</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">3</span>
                      <span>Review & Notification - We&apos;ll process your verification and notify you of the results</span>
                    </li>
                  </ul>
                </div>

                {/* Documents we accept section - additional content for desktop */}
                <div className="hidden lg:block bg-gray-50 rounded-lg py-6 sm:p-4">
                  <h3 className="font-medium text-gray-800 text-base mb-2 px-4 sm:px-0">Documents we accept</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm px-4 sm:px-0">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Info size={14} className="text-green-600" />
                      </div>
                      <span>Passport</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Info size={14} className="text-green-600" />
                      </div>
                      <span>Driver&apos;s License</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Info size={14} className="text-green-600" />
                      </div>
                      <span>National ID Card</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Info size={14} className="text-green-600" />
                      </div>
                      <span>Residence Permit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column for desktop */}
              <div className="lg:w-96">
                {/* Tab navigation - stays visible when scrolling content */}
                <div className="flex border-b mb-4 sm:mb-6 sticky top-0 bg-white pt-2 px-4 sm:px-0">
                  <button
                    className={`flex-1 py-3 sm:py-3 px-4 font-medium text-center text-sm sm:text-base ${activeTab === 'qr' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('qr')}
                  >
                    <div className="flex items-center justify-center">
                      <QrCode size={16} className="mr-1 sm:mr-2" />
                      Scan QR Code
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 sm:py-3 px-4 font-medium text-center text-sm sm:text-base ${activeTab === 'sms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('qr')}
                  >
                    <div className="flex items-center justify-center">
                      <Phone size={16} className="mr-1 sm:mr-2" />
                      Send Link via SMS
                    </div>
                  </button>
                </div>

                {/* Content based on active tab */}
                <div className="bg-white lg:border lg:border-gray-200 lg:rounded-lg lg:p-8">
                  {activeTab === 'qr' && (
                    <div className="flex flex-col items-center">
                      <QRCodeContainer>
                        <div className="w-40 h-40 sm:w-48 sm:h-48 relative">
                          <QRCodeGenerator size={200} value={currentURL} />
                        </div>
                      </QRCodeContainer>
                      <p className="text-gray-700 text-center text-sm sm:text-base mb-4 px-4 sm:px-0">
                        Scan the QR code with your smartphone camera app
                      </p>
                    </div>
                  )}
                  {activeTab === 'sms' && (
                    <div>
                      <p className="mb-4 text-gray-700 text-sm sm:text-base">
                        A secure link will be sent to your mobile at no additional cost.
                      </p>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                          >
                            {isLoading ? (
                              <option>Loading countries...</option>
                            ) : error ? (
                              <option>Error loading countries</option>
                            ) : (
                              countries.map((country) => (
                                <option key={`${country.id}`} value={`${country.phoneCode}`}>
                                  {country.name} ({country.phoneCode})
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Your phone number"
                            className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            inputMode="tel"
                          />
                        </div>
                        <button className="w-full p-2.5 sm:p-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium flex items-center justify-center text-sm sm:text-base touch-manipulation">
                          <span>Next</span>
                          <ArrowRight size={16} className="ml-2" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - fixed at bottom */}
        <div className="p-4 sm:p-6 border-t text-center text-xs sm:text-sm text-gray-500 space-y-2 bg-white mb-4 sm:mb-4">
          <div className="lg:flex lg:items-center lg:justify-between lg:space-y-0">
            <p className="lg:text-left">
              Learn more about how your personal data is processed in{' '}
              <a href="#" className="text-blue-600 hover:underline">KryoGuard&apos;s Privacy Notice</a>.
            </p>
            <p className="lg:text-right">
              Smartphone not available?{' '}
              <a href="#" onClick={() => setNextComponent('confirm')} className="text-blue-600 hover:underline">Proceed with your current device</a>.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <span>Powered by KryoGuard</span>
            <KryoLogo className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStart;