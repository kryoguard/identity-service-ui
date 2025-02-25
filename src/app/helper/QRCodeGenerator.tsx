"use client"

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeGenerator = ({
  value = 'https://example.com',
  size = 100,
  bgColor = '#ffffff',
  fgColor = '#000000',
  marginSize = 0,
}) => {

  const [shortenedUrl, setShortenedUrl] = useState(value);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const shortenUrl = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://is.gd/create.php?format=json&url=${encodeURIComponent(value)}`
        );

        if (!response.ok) {
          throw new Error('Failed to shorten URL');
        }

        const data = await response.json();
        if (data.shorturl) {
          setShortenedUrl(data.shorturl);
        } else {
          throw new Error(data.errorcode || 'Failed to get shortened URL');
        }
      } catch (err) {
        console.error('Error shortening URL:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        // Fallback to original URL if shortening fails
        setShortenedUrl(value);
      } finally {
        setIsLoading(false);
      }
    };

    shortenUrl();
  }, [value]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="p-2 bg-white rounded-lg shadow-lg">
          <QRCodeSVG
            value={shortenedUrl}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            marginSize={marginSize}
          />
        </div>
        <p className="text-red-500 text-sm mt-2">Failed to shorten URL</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-2 bg-white rounded-lg shadow-lg">
        {isLoading ? (
          <div className="animate-pulse bg-gray-200" style={{ width: size, height: size }} />
        ) : (
          <QRCodeSVG
            value={shortenedUrl}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            marginSize={marginSize}
          />
        )}
      </div>
      {isLoading && (
        <p className="text-sm text-gray-500 mt-2">loading...</p>
      )}
    </div>
  );
};

export default QRCodeGenerator;