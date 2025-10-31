"use client";

import React, { useState } from 'react';

interface FlagIconProps {
  countryCode: string;
  className?: string;
  size?: number;
}

/**
 * FlagIcon component that displays country flags using SVG from CDN
 * This ensures consistent rendering across all platforms (production & local)
 *
 * Uses flagcdn.com for reliable SVG flag icons
 */
export default function FlagIcon({ countryCode, className = '', size = 16 }: FlagIconProps) {
  const [hasError, setHasError] = useState(false);
  const lowerCode = countryCode.toLowerCase();

  if (hasError) {
    // Fallback: Show country code in a circle
    return (
      <div
        className={`inline-flex items-center justify-center bg-primary/10 text-primary text-[8px] font-semibold rounded-sm ${className}`}
        style={{ width: size, height: size * 0.75 }}
        title={`${countryCode} flag`}
      >
        {countryCode}
      </div>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w20/${lowerCode}.png`}
      srcSet={`https://flagcdn.com/w40/${lowerCode}.png 2x`}
      width={size}
      height={size * 0.75} // Standard flag ratio
      alt={`${countryCode} flag`}
      className={`inline-block object-cover rounded-sm ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

