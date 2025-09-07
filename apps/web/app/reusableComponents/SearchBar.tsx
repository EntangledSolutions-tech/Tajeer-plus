import React from 'react';
import { Input } from '@kit/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
  variant?: 'default' | 'blue-bg' | 'white-bg';
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search',
  className = '',
  width = 'w-72',
  variant = 'default'
}: SearchBarProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue-bg':
        return 'border-none bg-muted text-primary placeholder:text-primary/60 focus:outline-none focus:ring-0';
      case 'white-bg':
        return 'border border-primary/30 bg-white text-primary placeholder:text-primary/60 focus:border-primary focus:ring-0';
      default:
        return 'border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary hover:border-primary focus:ring-0';
    }
  };

  const getIconPosition = () => {
    switch (variant) {
      case 'blue-bg':
        return 'left-3';
      case 'white-bg':
        return 'right-3';
      default:
        return 'left-3';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'blue-bg':
      case 'white-bg':
        return 'text-primary/60';
      default:
        return 'text-gray-400';
    }
  };

  const getPaddingClass = () => {
    switch (variant) {
      case 'white-bg':
        return 'pr-10 pl-4';
      default:
        return 'pl-10 pr-4';
    }
  };

  return (
    <div className={`relative ${width} ${className}`}>
      <Search className={`absolute ${getIconPosition()} top-1/2 transform -translate-y-1/2 w-4 h-4 ${getIconColor()}`} />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${getPaddingClass()} py-2 rounded-lg ${getVariantClasses()}`}
      />
    </div>
  );
}

export default SearchBar;