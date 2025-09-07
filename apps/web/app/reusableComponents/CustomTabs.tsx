'use client';
import React from 'react';
import { Info } from 'lucide-react';

interface Tab {
  key: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string; // Optional reason for why the tab is disabled
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
  containerClassName?: string;
  showDisabledReason?: boolean; // Whether to show tooltip with disabled reason
}

export default function CustomTabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  containerClassName = '',
  showDisabledReason = true
}: CustomTabsProps) {
  return (
    <div className={`w-full ${containerClassName}`}>
      <div className={`flex items-center justify-between ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isDisabled = tab.disabled;

          return (
            <div key={tab.key} className="relative group">
              <button
                onClick={() => !isDisabled && onTabChange(tab.key)}
                disabled={isDisabled}
                className={`
                  px-10 py-3 text-sm font-medium transition-all duration-200 rounded-full whitespace-nowrap
                  ${isActive
                    ? 'text-white bg-[#343A40]'
                    : isDisabled
                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'text-[#6B7280] bg-transparent hover:text-[#343A40] hover:bg-gray-100 cursor-pointer'
                  }
                  ${isDisabled && 'opacity-60'}
                `}
              >
                {tab.label}
              </button>

              {/* Tooltip for disabled tabs */}
              {isDisabled && showDisabledReason && tab.disabledReason && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                  <div className="flex items-center gap-1">
                    <Info className="w-7 h-7" />
                    <span>{tab.disabledReason}</span>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
