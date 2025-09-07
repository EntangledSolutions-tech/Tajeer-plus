import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RadioButtonGroup({
  options,
  value,
  onChange,
  name,
  className = '',
  size = 'md'
}: RadioButtonGroupProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm gap-1 w-4 h-4';
      case 'lg':
        return 'text-lg gap-2 w-5 h-5';
      default:
        return 'text-sm gap-2 w-4 h-4';
    }
  };

  const sizeClasses = getSizeClasses();
  const [textSize, gapSize, radioSize] = sizeClasses.split(' ');

    return (
    <div className={`flex items-center gap-6 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center ${gapSize} text-primary ${textSize} font-medium cursor-pointer`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className={`accent-primary ${radioSize}`}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

export default RadioButtonGroup;