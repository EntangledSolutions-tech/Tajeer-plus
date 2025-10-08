"use client";

import React, { useState, createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import { useFormikContext } from 'formik';
import { ChevronDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

// Global dropdown state management
// This ensures only one dropdown can be open at a time across the entire application
interface DropdownContextType {
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export const DropdownProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  return (
    <DropdownContext.Provider value={{ activeDropdownId, setActiveDropdownId }}>
      {children}
    </DropdownContext.Provider>
  );
};

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdownContext must be used within a DropdownProvider');
  }
  return context;
};

// Simple Button without Formik
export const SimpleButton = ({
  children,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'default',
  size,
  icon,
  iconSide = 'left',
  ...props
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ReactNode;
  iconSide?: 'left' | 'right';
  [key: string]: any;
}) => {
  // Map 'primary' to 'default' since the Button component doesn't have a primary variant
  const buttonVariant = variant === 'primary' ? 'default' : variant;

  return (
    <Button
      type={type}
      disabled={disabled}
      className={className}
      variant={buttonVariant}
      size={size}
      {...props}
    >
      {icon && iconSide === 'left' && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
      {icon && iconSide === 'right' && <span className="ml-2 flex items-center">{icon}</span>}
    </Button>
  );
};

// Formik Button that uses SimpleButton
const CustomButton = ({
  children,
  type = 'button',
  disabled = false,
  className = '',
  isSecondary = false,
  isOval = false,
  isTransparent = false,
  isDropdown = false,
  dropdownOptions = [],
  variant,
  size,
  icon,
  iconSide = 'left',
  submittingText = 'Submitting...',
  onDropdownSelect,
  dropdownId,
  ...otherProps
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  isSecondary?: boolean;
  isOval?: boolean;
  isTransparent?: boolean;
  isDropdown?: boolean;
  dropdownOptions?: { label: string; value: string }[];
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ReactNode;
  iconSide?: 'left' | 'right';
  submittingText?: string;
  onDropdownSelect?: (option: { label: string; value: string }) => void;
  dropdownId?: string; // Optional unique ID for the dropdown. If not provided, a random ID will be generated
  [key: string]: any;
}) => {
  // Generate a unique ID for this dropdown if not provided
  const [generatedId] = useState(() => dropdownId || `dropdown-${Math.random().toString(36).substr(2, 9)}`);
  const dropdownIdToUse = dropdownId || generatedId;

  // Use global dropdown context if available, otherwise fallback to local state
  let activeDropdownId: string | null = null;
  let setActiveDropdownId: ((id: string | null) => void) | null = null;

  try {
    const dropdownContext = useDropdownContext();
    activeDropdownId = dropdownContext.activeDropdownId;
    setActiveDropdownId = dropdownContext.setActiveDropdownId;
  } catch {
    // Not within DropdownProvider, will use local state fallback
  }

  // Local state fallback for when not using DropdownProvider
  const [localDropdownOpen, setLocalDropdownOpen] = useState(false);

  // Determine if this dropdown is open
  const isDropdownOpen = setActiveDropdownId
    ? activeDropdownId === dropdownIdToUse
    : localDropdownOpen;



  // Safely get formik context, defaulting to undefined if not in formik context
  let isSubmitting = false;
  try {
    const formikContext = useFormikContext();
    isSubmitting = formikContext?.isSubmitting || false;
  } catch {
    // Not in formik context, isSubmitting remains false
  }

  // If it's a submit button, disable it when form is submitting
  const isDisabled = type === 'submit' ? isSubmitting || disabled : disabled;

  // Convert isSecondary to variant="secondary" if not already specified
  const buttonVariant = variant || (isSecondary ? 'secondary' : 'default');

  // Build custom styling based on props
  const buildCustomClasses = () => {
    let classes = [];

    // Oval shape
    if (isOval) {
      classes.push('rounded-full');
    }

    // Handle isSecondary with isTransparent priority
    if (isSecondary) {
      if (isTransparent) {
        classes.push('bg-transparent border border-dark-gray text-dark-gray hover:bg-gray-50');
      } else {
        classes.push('bg-white border border-dark-gray text-dark-gray hover:bg-gray-50');
      }
    } else if (isTransparent) {
      classes.push('bg-transparent');
    }

    return classes.join(' ');
  };

  const customClasses = buildCustomClasses();
  const finalClassName = `${customClasses} ${className}`.trim();


  const handleOptionSelect = (option: { label: string; value: string }) => {
    onDropdownSelect?.(option);
  };

  if (isDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SimpleButton
            type={type}
            disabled={isDisabled}
            className={finalClassName}
            variant={buttonVariant}
            size={size}
            {...otherProps}
          >
            <div className="flex items-center gap-2">
              {icon && iconSide === 'left' && <span className="flex items-center">{icon}</span>}
              {type === 'submit' && isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>{submittingText}</span>
                </div>
              ) : (
                children
              )}
              {icon && iconSide === 'right' && <span className="flex items-center">{icon}</span>}
              <ChevronDown className="w-4 h-4" />
            </div>
          </SimpleButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="start">
          {dropdownOptions.map((option, index) => {
            if (option.value === 'create-branch') {
              return (
                <React.Fragment key={index}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-primary font-semibold cursor-pointer"
                    onClick={() => handleOptionSelect(option)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            }
            return (
              <DropdownMenuItem
                key={index}
                className="cursor-pointer"
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <SimpleButton
      type={type}
      disabled={isDisabled}
      className={finalClassName}
      variant={buttonVariant}
      size={size}
      icon={icon}
      iconSide={iconSide}
      {...otherProps}
    >
      {type === 'submit' && isSubmitting ? (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          <span>{submittingText}</span>
        </div>
      ) : (
        children
      )}
    </SimpleButton>
  );
};

export default CustomButton;