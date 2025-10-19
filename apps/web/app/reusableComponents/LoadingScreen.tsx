'use client';

import React from 'react';
import { TajeerLogoAnimated } from './TajeerLogoAnimated';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

/**
 * Loading screen component with animated Tajeer logo
 *
 * @param fullScreen - If true, displays as full screen overlay
 * @param message - Optional loading message to display below the logo
 *
 * @example
 * ```tsx
 * <LoadingScreen />
 * <LoadingScreen fullScreen message="Loading your data..." />
 * ```
 */
export function LoadingScreen({
  fullScreen = true,
  message
}: LoadingScreenProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <TajeerLogoAnimated className="w-32 h-auto" />
      {message && (
        <p className="mt-6 text-lg text-[#005F8E] font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Inline loader component for smaller loading states
 *
 * @example
 * ```tsx
 * <InlineLoader size="sm" />
 * <InlineLoader size="md" message="Loading..." />
 * ```
 */
export function InlineLoader({
  size = 'md',
  message
}: {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}) {
  const sizeClasses = {
    sm: 'w-16',
    md: 'w-24',
    lg: 'w-32'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <TajeerLogoAnimated className={sizeClasses[size]} />
      {message && (
        <p className={`text-[#005F8E] font-medium ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
}

