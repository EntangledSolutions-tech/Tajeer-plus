import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@kit/ui/dialog';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../reusableComponents/CustomButton';
import { SimpleSelect } from '../../reusableComponents/CustomSelect';

interface CustomerStatus {
  id: string;
  name: string;
  color: string | null;
  description?: string;
}

interface StatusChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: CustomerStatus | null;
  availableStatuses: CustomerStatus[];
  onStatusChange: (statusId: string) => Promise<void>;
  loading?: boolean;
}

export default function StatusChangeModal({
  open,
  onOpenChange,
  currentStatus,
  availableStatuses,
  onStatusChange,
  loading = false
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus?.id || '');

  const handleSave = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await onStatusChange(selectedStatus);
      toast.success('Status updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const statusOptions = availableStatuses.map(status => ({
    value: status.id,
    label: status.name,
    color: status.color || undefined
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold text-primary mb-6">
          Change Customer Status
        </DialogTitle>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className="text-sm text-gray-600">
              {currentStatus?.name || 'No status set'}
            </div>
          </div>

          <div>
            <SimpleSelect
              label="New Status"
              required={true}
              options={statusOptions}
              value={selectedStatus}
              onChange={(value: string) => setSelectedStatus(value)}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="button"
              onClick={handleSave}
              disabled={loading || !selectedStatus}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
