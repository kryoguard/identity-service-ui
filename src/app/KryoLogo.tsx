import React from "react";

const KryoLogo = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" {...props}>
            {/* Shield Background  */}
            <path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48z"
                fill="#4A90E2"
                stroke="#2C3E50"
                strokeWidth="20" />

            {/* Shield Interior Symbol */}
            <path d="M256 96c-88.366 0-160 71.634-160 160s71.634 160 160 160 160-71.634 160-160S344.366 96 256 96z"
                fill="#FFFFFF"
                opacity="0.7" />

            {/*  Central Protection Symbol */}
            <path d="M256 176c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z"
                fill="#2C3E50" />
        </svg>
    );
};

export default KryoLogo;