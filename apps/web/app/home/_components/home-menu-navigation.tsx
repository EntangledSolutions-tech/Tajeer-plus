"use client";

import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { Bell, Plus } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import { SimpleInput } from '../../reusableComponents/CustomInput';
import { BranchSelector } from '~/components/branch-selector';

export function HomeMenuNavigation() {
  return (
    <div className="flex w-full items-center justify-between gap-4 px-6 py-4 relative z-50 min-h-[64px]">
      {/* Center: Search bar */}
      <div className="flex-1 flex justify-left">
        <SimpleInput
          placeholder="Search vehicles, customers, contracts..."
          className="w-[400px] rounded-lg   px-4 text-foreground  focus:ring-0 shadow-none"
        />
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
