

const QRCodeContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative w-60 h-60 mx-auto">
            {/* Top-left corner */}
            <div className="absolute -top-[2px] -left-[2px] w-10 h-10 rounded-tl-lg border-t-2 border-l-2 border-emerald-600" />

            {/* Top-right corner */}
            <div className="absolute -top-[2px] -right-[2px] w-10 h-10 rounded-tr-lg border-t-2 border-r-2 border-emerald-600" />

            {/* Bottom-left corner */}
            <div className="absolute -bottom-[2px] -left-[2px] w-10 h-10 rounded-bl-lg border-b-2 border-l-2 border-emerald-600" />

            {/* Bottom-right corner */}
            <div className="absolute -bottom-[2px] -right-[2px] w-10 h-10 rounded-br-lg border-b-2 border-r-2 border-emerald-600" />

            {/* Content container */}
            <div className="w-full h-full flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default QRCodeContainer;