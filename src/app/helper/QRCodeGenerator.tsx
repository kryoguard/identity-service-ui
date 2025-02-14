"use client"

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

const QRCodeGenerator = ({ 
    value = 'https://example.com',
    size = 100,
    bgColor = '#ffffff',
    fgColor = '#000000',
    marginSize = 0,
  }) => {
    return (
      <div className="flex items-center justify-center">
        <div className="p-2 bg-white rounded-lg shadow-lg">
          <QRCodeSVG
            value={value}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            marginSize={marginSize}
          />
        </div>
      </div>
    );
  };

export default QRCodeGenerator;