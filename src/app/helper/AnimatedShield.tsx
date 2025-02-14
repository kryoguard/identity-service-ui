import React, { useState } from 'react';

interface AnimatedShieldProps {
  size?: number;
  backgroundColor?: string;
  strokeColor?: string;
  innerColor?: string;
  centerColor?: string;
  pulseSpeed?: string;
  spinSpeed?: string;
  glowIntensity?: string;
  isAnimating?: boolean;
  animationType?: 'pulse' | 'rotate' | 'bounce' | 'glow' | 'ripple';
  isInteractive?: boolean;
  isProcessing?: boolean;
  onClick?: () => void;
  className?: string;
}

const AnimatedShield: React.FC<AnimatedShieldProps> = ({
  size = 200,
  backgroundColor = '#4A90E2',
  strokeColor = '#2C3E50',
  innerColor = '#FFFFFF',
  centerColor = '#2C3E50',
  pulseSpeed = '2s',
  spinSpeed = '10s',
  glowIntensity = '15px',
  isAnimating = true,
  animationType = 'pulse',
  isInteractive = true,
  isProcessing = false,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (isInteractive) {
      setIsClicked(true);
      onClick?.();
      setTimeout(() => setIsClicked(false), 500);
    }
  };

  // Get animation based on type
  const getMainAnimation = () => {
    switch (animationType) {
      case 'pulse':
        return `pulse ${pulseSpeed} infinite`;
      case 'rotate':
        return `rotate ${spinSpeed} linear infinite`;
      case 'bounce':
        return `bounce ${pulseSpeed} infinite`;
      case 'glow':
        return `glow ${pulseSpeed} infinite`;
      case 'ripple':
        return `ripple ${pulseSpeed} infinite`;
      default:
        return 'none';
    }
  };

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        onMouseEnter={() => isInteractive && setIsHovered(true)}
        onMouseLeave={() => isInteractive && setIsHovered(false)}
        onClick={handleClick}
      >
        <svg
          className={`w-full h-full origin-center transition-transform duration-300
            ${isHovered ? 'scale-110' : ''}
            ${isClicked ? 'scale-95' : ''}
            cursor-pointer`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          {/* Main Shield Group - Handles main animation */}
          <g 
            className="main-animation"
            style={{
              animation: isAnimating ? getMainAnimation() : 'none',
              transformOrigin: 'center',
            }}
          >
            {/* Shield Background */}
            <path
              d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48z"
              fill={backgroundColor}
              stroke={strokeColor}
              strokeWidth="20"
              style={{
                filter: animationType === 'glow' ? `drop-shadow(0 0 ${glowIntensity} ${backgroundColor})` : 'none'
              }}
            />

            {/* Shield Interior Symbol */}
            <path
              d="M256 96c-88.366 0-160 71.634-160 160s71.634 160 160 160 160-71.634 160-160S344.366 96 256 96z"
              fill={innerColor}
              opacity="0.7"
            />

            {/* Central Protection Symbol */}
            <circle
              cx="256"
              cy="256"
              r="80"
              fill={centerColor}
              style={{
                animation: animationType === 'rotate' ? `rotate ${spinSpeed} linear infinite` : 'none',
                transformOrigin: 'center'
              }}
            />
          </g>
        </svg>

        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes bounce {
            0% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0); }
          }

          @keyframes glow {
            0% { filter: drop-shadow(0 0 2px ${backgroundColor}); }
            50% { filter: drop-shadow(0 0 ${glowIntensity} ${backgroundColor}); }
            100% { filter: drop-shadow(0 0 2px ${backgroundColor}); }
          }

          @keyframes ripple {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 0.9; }
            100% { transform: scale(1); opacity: 0.7; }
          }

          .main-animation {
            transform-origin: center;
            transform-box: fill-box;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AnimatedShield;