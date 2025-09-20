'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Search, Edit, Trash2, Plus, FileSpreadsheet, ArrowRight, AlertTriangle, Building2 } from 'lucide-react';
import CustomButton from '../../reusableComponents/CustomButton';
import CustomTable, { TableColumn, TableAction } from '../../reusableComponents/CustomTable';
import { SearchBar } from '../../reusableComponents/SearchBar';
import RadioButtonGroup from '../../reusableComponents/RadioButtonGroup';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@kit/ui/alert-dialog';
import { toast } from '@kit/ui/sonner';
import AccidentModal from './AccidentModal';
import TotalLossModal from './TotalLossModal';
import BranchTransferModal from './BranchTransferModal';
import CustomCard from '../../reusableComponents/CustomCard';
import { useHttpService } from '../../../lib/http-service';

interface TransferLog {
  id: string;
  date: string;
  type: 'Accident' | 'Branch transfer' | 'Destroyed/Total Loss';
  from: string;
  to: string;
  details: string;
  created_at?: string;
}

export default function VehicleTransfersLogs() {
  const params = useParams();
  const vehicleId = params?.id as string;

  // State management using single loading state object as per memory
  const [loading, setLoading] = useState({
    transfersLoading: true,
    actionLoading: false,
    deleteLoading: false
  });

  const [transfers, setTransfers] = useState<TransferLog[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<TransferLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<TransferLog | null>(null);
  const [showAccidentModal, setShowAccidentModal] = useState(false);
  const [showTotalLossModal, setShowTotalLossModal] = useState(false);
  const [showBranchTransferModal, setShowBranchTransferModal] = useState(false);
  const { getRequest, postRequest, putRequest, deleteRequest } = useHttpService();

  // Sample data to demonstrate functionality
  const sampleTransfers: TransferLog[] = [
    {
      id: '1',
      date: '11/22/2021',
      type: 'Accident',
      from: '#Branch1',
      to: 'Workshop',
      details: 'Lorem ipsum dolor sit amet consectetur. Ultrices consequat libero massa convallis.',
      created_at: '2021-11-22T10:00:00Z'
    },
    {
      id: '2',
      date: '07/30/2020',
      type: 'Branch transfer',
      from: '#Branch1',
      to: '#Branch2',
      details: 'Lorem ipsum dolor sit amet consectetur. Ultrices consequat libero massa convallis.',
      created_at: '2020-07-30T14:30:00Z'
    },
    {
      id: '3',
      date: '07/30/2020',
      type: 'Branch transfer',
      from: '#Branch2',
      to: '#Branch1',
      details: 'Lorem ipsum dolor sit amet consectetur. Ultrices consequat libero massa convallis.',
      created_at: '2020-07-30T16:45:00Z'
    }
  ];

  // Radio button options
  const filterOptions = [
    { value: 'All', label: 'All' },
    { value: 'Accident', label: 'Accident' },
    { value: 'Branch transfer', label: 'Branch transfer' },
    { value: 'Destroyed/Total Loss', label: 'Destroyed/Total Loss' }
  ];

    // Fetch transfers data
  const fetchTransfers = async () => {
    try {
      setLoading(prev => ({ ...prev, transfersLoading: true }));
      setError(null);

      // Fetch transfer logs from the API
      const response = await getRequest(`/api/vehicles/${vehicleId}/transfers`);

      if (response.success && response.data) {
        // Sort by created_at in descending order (latest first) to ensure proper ordering
        const sortedTransfers = response.data.sort((a: TransferLog, b: TransferLog) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order (latest first)
        });

        setTransfers(sortedTransfers);
        setFilteredTransfers(sortedTransfers);
      } else {
        console.error('Error fetching transfers:', response.error);
        setError(response.error || 'Failed to fetch transfer logs');
        if (response.error) {
          alert(`Error: ${response.error}`);
        }
        // Fallback to sample data if API fails (already sorted in descending order)
        setTransfers(sampleTransfers);
        setFilteredTransfers(sampleTransfers);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setError('Failed to load transfer logs');
      // Fallback to sample data if API fails (already sorted in descending order)
      setTransfers(sampleTransfers);
      setFilteredTransfers(sampleTransfers);
    } finally {
      setLoading(prev => ({ ...prev, transfersLoading: false }));
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (vehicleId) {
      fetchTransfers();
    }
  }, [vehicleId]);

  // Filter and search transfers
  useEffect(() => {
    let filtered = transfers;

    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter(transfer => transfer.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transfer =>
        transfer.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransfers(filtered);
  }, [transfers, filterType, searchTerm]);

  // Handle delete transfer
  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(prev => ({ ...prev, deleteLoading: true }));
      setError(null);

      // Determine the correct API endpoint based on transfer type
      let deleteEndpoint = '';
      switch (deleteItem.type) {
        case 'Accident':
          deleteEndpoint = `/api/vehicles/${vehicleId}/accidents/${deleteItem.id}`;
          break;
        case 'Destroyed/Total Loss':
          // For total loss, we might need to delete from vehicle_total_loss table
          // For now, we'll use a generic transfer delete endpoint
          deleteEndpoint = `/api/vehicles/${vehicleId}/transfers?id=${deleteItem.id}`;
          break;
        case 'Branch transfer':
          // For branch transfers, we might need to delete from vehicle_transfers table
          deleteEndpoint = `/api/vehicles/${vehicleId}/transfers?id=${deleteItem.id}`;
          break;
        default:
          throw new Error('Unknown transfer type');
      }

      const response = await deleteRequest(deleteEndpoint);

      if (response.success) {
        // Remove from local state on successful deletion
        setTransfers(prev => prev.filter(t => t.id !== deleteItem.id));
        setFilteredTransfers(prev => prev.filter(t => t.id !== deleteItem.id));
        setDeleteItem(null);

        // Show success message
        toast.success('Transfer log deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete transfer log');
      }
    } catch (error) {
      console.error('Error deleting transfer:', error);
      setError('Failed to delete transfer log');
    } finally {
      setLoading(prev => ({ ...prev, deleteLoading: false }));
    }
  };

  // Handle successful accident creation
  const handleAccidentSuccess = () => {
    fetchTransfers(); // Refresh the transfers list
  };

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'date',
      label: 'Date',
      type: 'text',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      type: 'text',
      sortable: true,
    },
    {
      key: 'from',
      label: 'From',
      type: 'text',
      sortable: true,
    },
    {
      key: 'to',
      label: 'To',
      type: 'text',
      sortable: true,
    },
    {
      key: 'details',
      label: 'Details',
      type: 'text',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
  ];

  // Prepare table data
  const tableData = filteredTransfers.map((transfer) => ({
    id: transfer.id,
    date: transfer.date,
    type: transfer.type,
    from: transfer.from,
    to: transfer.to,
    details: transfer.details,
  }));

  // Define table actions
  const tableActions: TableAction[] = [
    {
      key: 'delete',
      label: '',
      icon: <Trash2 className="w-4 h-4 text-red-600 hover:bg-red-50 hover:text-red-700" />,
      variant: 'ghost',
      onClick: (row: any) => {
        const transfer = filteredTransfers.find(t => t.id === row.id);
        if (transfer) {
          setDeleteItem(transfer);
        }
      },
      className: 'text-red-600',
    },
  ];

  // Loading state
  if (loading.transfersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-primary">Loading transfer logs...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg font-semibold text-center">
          {error}
          <button className="ml-4 text-blue-700 underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CustomButton
          isSecondary
          isOval
          onClick={() => setShowBranchTransferModal(true)}
          className="flex items-center justify-center gap-3 py-4"
        >
          <Building2 className="w-5 h-5" />
          Transfer to another branch
        </CustomButton>

        <CustomButton
          isSecondary
          isOval
          onClick={() => setShowAccidentModal(true)}
          className="flex items-center justify-center gap-3 py-4"
        >
          <AlertTriangle className="w-5 h-5" />
          Accident Transfer
        </CustomButton>

        <CustomButton
          isSecondary
          isOval
          onClick={() => setShowTotalLossModal(true)}
          className="flex items-center justify-center gap-3 py-4"
        >
          <Trash2 className="w-5 h-5" />
          Mark as Destroyed/Total Loss
        </CustomButton>
      </div>

      {/* CustomCard wrapper for filters, search, and table */}
      <CustomCard shadow="sm" radius="xl" padding="none" className="overflow-hidden">
        {/* Filters and Search Row */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          {/* Left side - Radio buttons */}
          <RadioButtonGroup
            options={filterOptions}
            value={filterType}
            onChange={setFilterType}
            name="transferType"
            className="flex gap-4"
          />

          {/* Right side - Search and Export */}
          <div className="flex items-center gap-4">
            <SearchBar
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={setSearchTerm}
              width="w-64"
            />
            <CustomButton
              isSecondary
              size="sm"
              className="p-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            </CustomButton>
          </div>
        </div>

        {/* Table */}
        <CustomTable
          data={tableData}
          columns={columns}
          actions={tableActions}
          emptyMessage="No transfer logs found"
          tableBackground="transparent"
          searchable={false}
          pagination={false}
        />
      </CustomCard>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteItem !== null}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Transfer Log</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transfer log? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={loading.deleteLoading}
            >
              {loading.deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accident Modal */}
      <AccidentModal
        isOpen={showAccidentModal}
        onClose={() => setShowAccidentModal(false)}
        vehicleId={vehicleId}
        onSuccess={handleAccidentSuccess}
      />

      {/* Total Loss Modal */}
      <TotalLossModal
        isOpen={showTotalLossModal}
        onClose={() => setShowTotalLossModal(false)}
        vehicleId={vehicleId}
        onSuccess={handleAccidentSuccess}
      />

      {/* Branch Transfer Modal */}
      <BranchTransferModal
        isOpen={showBranchTransferModal}
        onClose={() => setShowBranchTransferModal(false)}
        vehicleId={vehicleId}
        onSuccess={handleAccidentSuccess}
      />
    </div>
  );
}
