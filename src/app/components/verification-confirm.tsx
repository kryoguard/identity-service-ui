import { X } from 'lucide-react';
import KryoLogo from '../KryoLogo';
import SelfieImage from '../SelfieImage';
import { ComponentState } from '../helper/custom-types';

const VerificationConfirm = ({setNextComponent}:{ setNextComponent: (component: ComponentState) => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-md mx-auto my-4 p-4 sm:p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="w-6" /> {/* Spacer */}
                    <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-semibold text-blue-500">KryoGuard</span>
                        <KryoLogo className="w-5 h-5 sm:w-6 sm:h-6" />
                        {/* <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-full" /> */}
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-semibold text-gray-600">What you can expect next</h1>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        You will need to provide your ID and a selfie. It&apos;s a fast, secure process trusted by millions of users worldwide.
                    </p>
                </div>

                {/* Illustration */}
                <div className="my-8 flex justify-center">
                    <div className="relative w-72 h-72">
                        {/* Person with Phone Illustration */}
                        <SelfieImage />
                    </div>
                </div>

                {/* Footer */}
                <div className="space-y-4">
                    <p className="text-center text-sm text-gray-600">
                        Your session may be recorded, including audio and video.
                    </p>
                    <p className="text-center text-sm text-gray-600">
                        Read{' '}
                        <button className="text-blue-600 hover:underline">
                            Privacy Notice
                        </button>
                        {' '}to learn more about our personal data processing and cookie usage.
                    </p>

                    <button className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-emerald-800 transition-colors" onClick={() => setNextComponent('document')}>
                        Proceed!
                    </button>

                    <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 mt-4">
                        Powered by KryoGuard
                        <KryoLogo className="w-2 h-2 sm:w-3 sm:h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationConfirm;