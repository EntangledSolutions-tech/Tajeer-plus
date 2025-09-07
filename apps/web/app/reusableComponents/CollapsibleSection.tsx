import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  headerButton?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  collapsible = true,
  headerButton,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  // If there's a headerButton, use a div to avoid nested buttons
  // If no headerButton, use a button for better accessibility
  const HeaderElement = headerButton ? 'div' : 'button';
  const headerProps = headerButton ? {} : {
    onClick: toggleOpen,
    disabled: !collapsible
  };

  return (
    <div className={`bg-white rounded-xl border border-border ${className}`}>
      {/* Header */}
      <HeaderElement
        {...headerProps}
        className={`flex items-center gap-2 text-primary font-bold text-[18px] bg-muted py-2 px-6 w-full text-left flex justify-between w-full rounded-t-xl ${
          collapsible && !headerButton ? 'cursor-pointer hover:bg-accent' : 'cursor-default'
        } ${headerClassName}`}
      >
        <div
          className="flex items-center gap-2 flex-1"
          onClick={headerButton ? toggleOpen : undefined}
          style={{ cursor: headerButton && collapsible ? 'pointer' : 'default' }}
        >
          {collapsible && (
            <span className="text-[18px]">{isOpen ? '▼' : '▶'}</span>
          )}
          {title}
        </div>
        {headerButton && (
          <div onClick={(e) => e.stopPropagation()}>
            {headerButton}
          </div>
        )}
      </HeaderElement>

      {/* Content */}
      {(isOpen || !collapsible) && (
        <div className={`p-6 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;