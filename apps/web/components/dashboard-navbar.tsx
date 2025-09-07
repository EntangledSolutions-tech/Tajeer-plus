import { ProfileAccountDropdownContainer } from './personal-account-dropdown-container';
import { Bell, Plus } from 'lucide-react';
import CustomButton from '../app/reusableComponents/CustomButton';
import CustomInput from '../app/reusableComponents/CustomInput';
import { BranchSelector } from './branch-selector';

export function DashboardNavbar() {
  return (
    <div className="flex w-full items-center justify-between gap-4 bg-[#F2F7FF] px-6 py-4 border-b border-[#E3EEFF]">
      {/* Left: Logo and Navigation */}
      <div className="flex items-center gap-8 min-w-0">
        {/* Logo placeholder - can be replaced with actual logo */}
        <div className="text-lg font-bold text-gray-800">تأجير</div>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 flex justify-center">
        <CustomInput
          name="search"
          placeholder="Search vehicles, customers, contracts..."
          className="w-[400px] rounded-lg  bg-white px-4 py-2    focus:ring-0 shadow-none"
        />
      </div>

      {/* Right: Branch, New, Notification, Profile */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Branch Dropdown */}
        <BranchSelector />

        {/* New Button */}
        <CustomButton className="bg-white hover:bg-gray-50 text-[#0065F2] border border-[#0065F2] font-semibold rounded-lg px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New
        </CustomButton>

        {/* Notification Icon */}
        <CustomButton variant="ghost" size="icon" className="rounded-full hover:bg-[#CDE2FF] text-white">
          <Bell className="w-6 h-6" />
        </CustomButton>

        {/* Profile Dropdown */}
        <ProfileAccountDropdownContainer showProfileName={false} />
      </div>
    </div>
  );
}