"use client"

import { useState, useEffect } from "react";
import { X, Smartphone, CreditCard } from 'lucide-react';
import QRCodeContainer from "../helper/qrContainer";
import { ComponentState } from "../helper/custom-types";
import Link from "next/link";
import QRCodeGenerator from "../helper/qrCodeGenerator";
import KryoLogo from "../assets/kryoLogo";

interface Country {
    id: string;
    name: string;
    phoneCode: string;
    iso: string;
}
// interface Locale {
//     language: string;
//     timeZone: string;
//     languages: string[];
//     region: string;
// }

export const VerificationStart = ({ token, setNextComponent }: { token: string, setNextComponent: (component: ComponentState) => void }) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('Canada (+1)');
    const [phoneNumber, setPhoneNumber] = useState('');
    // const [locale, setLocale] = useState<Locale>({
    //     language: '',
    //     timeZone: '',
    //     languages: [],
    //     region: ''
    //   });

    const currentURL = process.env.NEXT_PUBLIC_URL + '/v/' + token;
    const idsm_url = process.env.NEXT_PUBLIC_IDSM_BASE_URL || 'http://localhost:8080';

    // // Get primary language (e.g., 'en-US')
    // const language = navigator.language;
    
    // // Get all languages in user's preference order
    // const languages = navigator.languages;
    
    // // Get timezone (e.g., 'America/New_York')
    // const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // // Get region from primary language
    // const region = new Intl.Locale(language).region;

    // setLocale({
    //   language,
    //   timeZone,
    //   languages: [...languages],
    //   region: region || ''
    // });

    // console.log('Languages:', locale);

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
                console.error('Error fetching countries:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch countries');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCountries();
    }, [idsm_url]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center pt-5">
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
                <h1 className="text-2xl sm:text-3xl font-semibold text-center text-gray-900">Let&apos;s complete your verification</h1>

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
                        Learn more about how your personal data is processed in KryoGuard&apos;s Privacy Notice.
                    </p>
                    <Link href={'#'} className="text-gray-600" onClick={() => setNextComponent('confirm')}>
                        Smartphone not available? Proceed with your current device.
                    </Link>
                    <p className="text-gray-400 flex items-center justify-center gap-1">
                        Powered by KryoGuard <KryoLogo className="w-5 h-5 sm:w-5 sm:h-5" />
                    </p>
                </div>

            </div>
        </div >
    );
};

export default VerificationStart;