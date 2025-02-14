"use client"

import { useState } from "react";
import { X, Smartphone, CreditCard } from 'lucide-react';
import KryoLogo from "../KryoLogo";
import QRCodeGenerator from "../helper/QRCodeGenerator";
import QRCodeContainer from "../helper/QRContainer";
import countries from "../countries.json";


export const VerificationStart = ({ currentSession }: { currentSession: string | null }) => {
    currentSession = currentSession || 'NA';
    const currentURL = process.env.NEXT_PUBLIC_URL + '/?v=' + currentSession;

    console.log(currentURL);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('Canada (+1)');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center pt-20">
                    <div className="w-6 sm:w-8" /> {/* Spacer */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-4xl font-semibold text-blue-500">KryoGuard</span>
                        <KryoLogo className="w-10 h-10 sm:w-10 sm:h-10" />
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-full touch-manipulation">
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-semibold text-center text-gray-900">Let's complete your verification</h1>

                {/* Requirements */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4 mx-auto">
                    <div className="flex gap-3">
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-sm sm:text-base text-gray-900">Please have a valid document ready</p>
                            <p className="text-gray-600 text-xs sm:text-sm">Make sure it is valid and undamaged</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="font-medium text-sm sm:text-base text-gray-900">Consider Using a Smartphone</p>
                            <p className="text-gray-600 text-xs sm:text-sm">For better quality, consider using a smartphone</p>
                        </div>
                    </div>
                </div>

                {/* Options - Stack on mobile, side by side on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* QR Code Option */}
                    <div className="border rounded-lg p-3 sm:p-4">
                        <h3 className="font-medium text-sm sm:text-base mb-2 text-gray-900">Option 1: Use the QR Code</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Scan the QR code with your smartphone camera app</p>
                        {/* <div className="bg-white border-2 border-emerald-600 w-40 h-40 sm:w-40 sm:h-40 mx-auto rounded-lg flex items-center justify-center"> */}
                        {/* <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200" /> */}
                        <QRCodeContainer>
                            <QRCodeGenerator size={120} value={currentURL} />
                        </QRCodeContainer>
                        {/* </div> */}
                    </div>

                    {/* SMS Option */}
                    <div className="border rounded-lg p-3 sm:p-4">
                        <h3 className="font-medium text-sm sm:text-base mb-2 text-gray-900">Option 2: Send link via SMS</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">A secure link will be sent to your mobile at no additional cost.</p>
                        <select
                            className="w-full p-2 border rounded mb-3 text-sm sm:text-base touch-manipulation"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            {countries.map((country) => (
                                <option key={country.code} value={`${country.name} (${country.code})`}>
                                    {country.name} ({country.code})
                                </option>
                            ))}
                        </select>
                        <input
                            type="tel"
                            placeholder="Your phone number"
                            className="w-full p-2 border rounded mb-3 text-sm sm:text-base"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <button className="w-full bg-gray-200 text-gray-700 py-2 rounded text-sm sm:text-base touch-manipulation">
                            Next
                        </button>
                    </div>
                </div>

                {/* Footer - Smaller text on mobile */}
                <div className="space-y-2 text-center text-xs sm:text-sm">
                    <p className="text-gray-600">
                        Learn more about how your personal data is processed in KryoGuard's Privacy Notice.
                    </p>
                    <p className="text-gray-600">
                        Smartphone not available? Proceed with your current device.
                    </p>
                    <p className="text-gray-400 flex items-center justify-center gap-1">
                        Powered by KryoGuard <KryoLogo className="w-5 h-5 sm:w-5 sm:h-5" />
                    </p>
                </div>

            </div>
        </div >
    );
};

export default VerificationStart;