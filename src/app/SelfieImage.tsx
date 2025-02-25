
const SelfieImage = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">

            <circle cx="200" cy="200" r="150" fill="#E0FFFF" />

            <path d="M160 320 L160 200 Q160 180 200 180 Q240 180 240 200 L240 320" fill="white" stroke="#1F2937" strokeWidth="4" />

            {/* Head */}
            <circle cx="200" cy="160" r="40" fill="white" stroke="#1F2937" strokeWidth="4" />

            {/* <!-- Smile --> */}
            <path d="M185 165 Q200 175 215 165" fill="none" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />

            {/* <!-- Phone --> */}
            <rect x="250" y="140" width="30" height="60" rx="4" fill="#1F2937" />

            {/* <!-- Arm holding phone --> */}
            <path d="M240 220 Q260 200 250 170" fill="none" stroke="#1F2937" strokeWidth="8" strokeLinecap="round" />

            {/* <!-- Shield with checkmark --> */}
            <g transform="translate(280, 120)">
                <path d="M0 0 L40 0 L40 50 L20 60 L0 50 Z" fill="#4ade80" />
                <path d="M10 25 L18 33 L30 15" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </svg>
    );
};

export default SelfieImage;