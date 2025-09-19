"use client";

import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { Bell, Plus } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import { SimpleInput } from '../../reusableComponents/CustomInput';
import { BranchSelector } from '~/components/branch-selector';
import { GlobalSearchDropdown } from '../../reusableComponents/GlobalSearchDropdown';
import { useState, useRef, useEffect } from 'react';

export function HomeMenuNavigation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is outside the search input container
      if (searchRef.current && !searchRef.current.contains(target)) {
        // Also check if click is on the dropdown (which is rendered via portal)
        const isDropdownClick = target.closest('[data-global-search-dropdown]');

        if (!isDropdownClick) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.trim().length >= 2);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-4 px-6 py-4 relative z-[100] min-h-[64px]">
      {/* Center: Search bar */}
      <div className="flex-1 flex justify-left">
        <div ref={searchRef} className="relative z-[200]">
          <SimpleInput
            placeholder="Search vehicles, customers, contracts..."
            className="w-[400px] rounded-lg px-4 text-foreground focus:ring-0 shadow-none"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
          />
          {showDropdown && (
            <GlobalSearchDropdown
              query={searchQuery}
              onClose={() => setShowDropdown(false)}
              searchInputRef={searchRef}
            />
          )}
        </div>
      </div>

      {/* Right: Branch, New, Notification, Profile */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Branch Dropdown */}
        <BranchSelector variant="transparent" />

        {/* New Button */}
        <CustomButton isSecondary variant='primary'>
          <Plus className="w-4 h-4" /> New
        </CustomButton>

        {/* Notification Icon */}
        <CustomButton variant="ghost" size="icon" className=" hover:bg-transparent">
          <Bell className="w-6 h-6 text-white"  />
        </CustomButton>

        {/* Profile Dropdown */}
        <ProfileAccountDropdownContainer showProfileName={false} />
      </div>
    </div>
  );
}
