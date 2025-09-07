"use client";

import React from 'react';
import { cn } from '@kit/ui/utils';
import { Info } from 'lucide-react';

export interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Shadow level for the card
   * @default "sm"
   */
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Elevation level (affects border and background)
   * @default "default"
   */
  elevation?: 'none' | 'low' | 'default' | 'high' | 'max';
  /**
   * Whether to show hover effects
   * @default true
   */
  hover?: boolean;
  /**
   * Border radius
   * @default "xl"
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /**
   * Border style
   * @default "default"
   */
  border?: 'none' | 'default' | 'subtle' | 'accent';
  /**
   * Background style
   * @default "default"
   */
  background?: 'default' | 'muted' | 'transparent';
  /**
   * Padding size
   * @default "default"
   */
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  /**
   * Whether the card is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Reason for why the card is disabled (shown in tooltip)
   */
  disabledReason?: string;
  /**
   * Whether to show tooltip with disabled reason
   * @default true
   */
  showDisabledReason?: boolean;
}

const CustomCard: React.FC<CustomCardProps> = ({
  children,
  shadow = 'sm',
  elevation = 'default',
  hover = true,
  radius = 'xl',
  border = 'default',
  background = 'default',
  padding = 'default',
  disabled = false,
  disabledReason,
  showDisabledReason = true,
  className,
  ...props
}) => {
  // Shadow classes mapping
  const shadowClasses = {
    none: '',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  // Elevation classes mapping
  const elevationClasses = {
    none: 'border-0 bg-transparent',
    low: 'border border-gray-100 bg-white',
    default: 'border border-gray-200 bg-white',
    high: 'border-2 border-gray-300 bg-white',
    max: 'border-2 border-gray-400 bg-white',
  };

  // Border radius classes mapping
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  // Border style classes mapping
  const borderClasses = {
    none: '',
    default: '',
    subtle: 'border-gray-100',
    accent: 'border-blue-200',
  };

  // Background classes mapping
  const backgroundClasses = {
    default: 'bg-white',
    muted: 'bg-gray-50',
    transparent: 'bg-transparent',
  };

  // Padding classes mapping
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  // Hover effects - disabled when card is disabled
  const hoverClasses = hover && !disabled
    ? 'transition-all duration-200 hover:shadow-lg hover:border-gray-300'
    : '';

  // Disabled styling
  const disabledClasses = disabled
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : '';

  const cardClasses = cn(
    // Base classes
    'text-card-foreground',

    // Dynamic classes
    shadowClasses[shadow],
    elevationClasses[elevation],
    radiusClasses[radius],
    borderClasses[border],
    backgroundClasses[background],
    paddingClasses[padding],

    // Hover effects
    hoverClasses,

    // Disabled styling
    disabledClasses,

    // Custom className
    className
  );

  return (
    <div className="relative group">
      <div className={cardClasses} {...props}>
        {children}
      </div>

      {/* Tooltip for disabled cards */}
      {disabled && showDisabledReason && disabledReason && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
          <div className="flex items-center gap-1">
            <Info className="w-4 h-4" />
            <span>{disabledReason}</span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default CustomCard;
