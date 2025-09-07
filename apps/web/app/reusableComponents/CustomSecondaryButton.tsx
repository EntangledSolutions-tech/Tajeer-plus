import React from 'react';

interface CustomSecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconSide?: 'left' | 'right';
  className?: string;
}

export const CustomSecondaryButton: React.FC<CustomSecondaryButtonProps> = ({
  children,
  icon,
  iconSide = 'left',
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`border border-primary text-primary bg-white font-semibold text-sm rounded-xl px-6 py-2 flex items-center whitespace-nowrap transition-colors hover:bg-muted ${className}`}
      {...props}
    >
      {icon && iconSide === 'left' && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
      {icon && iconSide === 'right' && <span className="ml-2 flex items-center">{icon}</span>}
    </button>
  );
};