'use client';

import type { User } from '@supabase/supabase-js';
import { ChevronLeft, Info } from 'lucide-react';
import { navigationConfig } from '~/config/navigation.config';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { isRouteActive } from '@kit/ui/utils';
import Image from 'next/image';

// Custom navigation icons to match Figma design
const NavigationIcons = {
  Dashboard: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Dashboard Fill.svg" : "/images/Icons/Dashboard Outline.svg"}
      alt="Dashboard"
      width={20}
      height={20}
      className={className}
    />
  ),
  Vehicles: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Vehicle Fill.svg" : "/images/Icons/Vehicle Outline.svg"}
      alt="Vehicles"
      width={20}
      height={20}
      className={className}
    />
  ),
  Customers: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Customers Fill.svg" : "/images/Icons/Customers Outline.svg"}
      alt="Customers"
      width={20}
      height={20}
      className={className}
    />
  ),
  Contracts: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Contracts Fill.svg" : "/images/Icons/Contracts Outline.svg"}
      alt="Contracts"
      width={20}
      height={20}
      className={className}
    />
  ),
  Finance: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Finance Fill.svg" : "/images/Icons/Finance Outline.svg"}
      alt="Finance"
      width={20}
      height={20}
      className={className}
    />
  ),
  Reports: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Report Fill.svg" : "/images/Icons/Report Outline.svg"}
      alt="Reports"
      width={20}
      height={20}
      className={className}
    />
  ),
  Inspections: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Inspection Fill.svg" : "/images/Icons/Inspection Outline.svg"}
      alt="Inspections"
      width={20}
      height={20}
      className={className}
    />
  ),
  Configurations: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src={isActive ? "/images/Icons/Configuration Fill.svg" : "/images/Icons/Configuration Outline.svg"}
      alt="Configurations"
      width={20}
      height={20}
      className={className}
    />
  ),
  Help: ({ className, isActive }: { className?: string; isActive?: boolean }) => (
    <Image
      src="/images/Icons/Help.svg"
      alt="Help"
      width={20}
      height={20}
      className={className}
    />
  ),
};

// Map menu labels to icon components
const getIconComponent = (label: string) => {
  switch (label) {
    case 'Dashboard': return NavigationIcons.Dashboard;
    case 'Vehicles': return NavigationIcons.Vehicles;
    case 'Customers': return NavigationIcons.Customers;
    case 'Contracts': return NavigationIcons.Contracts;
    case 'Finance': return NavigationIcons.Finance;
    case 'Reports': return NavigationIcons.Reports;
    case 'Inspections': return NavigationIcons.Inspections;
    case 'Configurations': return NavigationIcons.Configurations;
    case 'Help': return NavigationIcons.Help;
    default: return NavigationIcons.Dashboard;
  }
};

// Check if a menu item is disabled
const isMenuItemDisabled = (label: string): boolean => {
  const disabledItems = ['Inspections', 'Help'];
  return disabledItems.includes(label);
};

// Get disabled reason for a menu item
const getDisabledReason = (label: string): string => {
  const disabledReasons: Record<string, string> = {
    'Inspections': 'Inspection module is currently being updated.',
    'Help': 'Help documentation is being revised.'
  };
  return disabledReasons[label] || 'This feature is temporarily unavailable.';
};

export function HomeSidebar(props: {
  account?: any;
  user: User;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`h-screen flex flex-col bg-[#0472ac] relative transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} border-r border-[#005F8E]`}>
      {/* Top Logo */}
      <div className="flex items-center justify-center p-6">
        {!isCollapsed ? (
          <Image
            src="/images/Logo/Tajeer Plus Logo [2x].png"
            alt="Tajeer Plus"
            width={280}
            height={80}
            className="h-14 w-auto"
          />
        ) : (
          <Image
            src="/images/Side Nav Logo/Logo [2x].png"
            alt="Tajeer"
            width={40}
            height={40}
            className="w-12 h-12"
          />
        )}
      </div>

      {/* Floating Toggle Button - Positioned above center */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/3 w-6 h-6 bg-[#005F8E] text-white rounded-full flex items-center justify-center hover:bg-[#004a7a] transition-colors z-10 shadow-lg"
      >
        <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Navigation */}
      <div className="flex-1 py-6">
        <nav className="flex flex-col space-y-1 px-3">
          {navigationConfig.routes.filter((section: any) => !('divider' in section)).map((section: any, i: number) => (
            <div key={section.label}>
              {section.children.map((item: any) => {
                const isActive = isRouteActive(item.path, pathname, item.end);
                const IconComponent = getIconComponent(item.label);
                const isDisabled = isMenuItemDisabled(item.label);
                const disabledReason = getDisabledReason(item.label);

                const menuItemContent = (
                  <>
                    {/* Icon */}
                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                      <IconComponent
                        className={`filter brightness-0 invert ${isDisabled ? 'opacity-50' : ''}`}
                        isActive={isActive && !isDisabled}
                      />
                    </div>

                    {/* Label */}
                    {!isCollapsed && (
                      <span className={`flex-1 ml-3 text-sm font-medium ${isDisabled ? 'opacity-50' : ''}`}>
                        {item.label}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        {item.label}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}

                    {/* Disabled reason tooltip */}
                    {isDisabled && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg max-w-xs">
                        <div className="flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          <span>{disabledReason}</span>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    )}
                  </>
                );

                if (isDisabled) {
                  return (
                    <div
                      key={item.path}
                      className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm relative group mb-1 cursor-not-allowed opacity-60
                        ${isActive
                          ? 'bg-[#2d8ab9] text-white shadow-md'
                          : 'text-white'
                        }
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {menuItemContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm relative group mb-1
                      ${isActive
                        ? 'bg-[#2d8ab9] text-white shadow-md'
                        : 'text-white hover:bg-[#005F8E] hover:text-white'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {menuItemContent}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Logo - Much larger size */}
      <div className="p-4 pb-0 flex items-center ">
        <Image
          src="/images/Side Nav Logo/Logo [2x].png"
          alt="Tajeer"
          width={isCollapsed ? 48 : 80}
          height={isCollapsed ? 48 : 80}
          className={`${isCollapsed ? 'w-12 h-12' : 'w-38 h-38'} `}
        />
      </div>
    </div>
  );
}
