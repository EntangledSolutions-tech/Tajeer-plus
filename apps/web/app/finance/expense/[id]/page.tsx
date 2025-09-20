'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Edit, MoreHorizontal, ChevronDown, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@kit/ui/dialog';
import { toast } from '@kit/ui/sonner';
import CustomButton from '../../../reusableComponents/CustomButton';
import CollapsibleSection from '../../../reusableComponents/CollapsibleSection';
import { ExpenseForm } from '../../rental-finances/ExpenseForm';
import { useHttpService } from '../../../../lib/http-service';

interface Expense {
  id: string;
  transaction_number: string;
  transaction_date: string;
  amount: number;
  description: string;
  employee_name: string;
  status: string;
  transaction_type: {
    id: string;
    name: string;
    category: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  vehicle?: {
    id: string;
    plate_number: string;
    make: { name: string };
    model: { name: string };
    make_year: string;
  };
  contract?: {
    id: string;
    contract_number: string;
    customer_name: string;
    start_date: string;
    end_date: string;
    created_at: string;
  };
  customer?: {
    id: string;
    name: string;
    id_type: string;
    id_number: string;
    classification_id: string;
    mobile_number: string;
    nationality_id: string;
    date_of_birth: string;
    address: string;
    membership_tier: string;
  };
  rental_expense?: {
    vendor_name: string;
    receipt_number: string;
    receipt_date: string;
  };
  payment_method?: string;
  linked_invoice?: string;
}

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getRequest, deleteRequest } = useHttpService();
  const expenseId = params.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Options for edit form
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`/api/finance/expense/${expenseId}`);

      if (response.success && response.data) {
        setExpense(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch expense details');
      }
    } catch (err) {
      console.error('Error fetching expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expense');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      // Fetch vehicles
      const vehiclesResponse = await getRequest('/api/vehicles?limit=-1');
      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.data.vehicles || []);
      }

      // Fetch branches
      const branchesResponse = await getRequest('/api/branches?limit=-1');
      if (branchesResponse.success) {
        setBranches(branchesResponse.data.branches || []);
      }

      // Fetch contracts
      const contractsResponse = await getRequest('/api/contracts?limit=-1');
      if (contractsResponse.success) {
        setContracts(contractsResponse.data.contracts || []);
      }

      // Fetch employees (you might need to create this API endpoint)
      // For now, we'll use an empty array
      setEmployees([]);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    if (expenseId) {
      fetchExpense();
      fetchOptions();
    }
  }, [expenseId]);

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleEdit = () => {
    console.log('Edit button clicked, opening modal');
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    // Refresh the expense data
    await fetchExpense();
    toast.success('Expense updated successfully!', {
      description: 'The expense transaction has been updated.',
      duration: 4000,
    });
  };

  const confirmDelete = async () => {
    if (!expense) return;

    try {
      setIsDeleting(true);
      const response = await deleteRequest(`/api/finance/expense/${expenseId}`);

      if (response.success) {
        // Show success toast
        toast.success('Expense deleted successfully!', {
          description: `Transaction ${expense.transaction_number} has been deleted.`,
          duration: 4000,
        });

        // Close modal and redirect to the finance list page
        setIsDeleteModalOpen(false);
        router.push('/finance/rental-finances');
      } else {
        throw new Error(response.error || 'Failed to delete expense');
      }
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      toast.error('Failed to delete expense', {
        description: err?.message || 'An unexpected error occurred. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff]">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mx-4 mt-4">
          Expense not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-transparent">
        <div className="px-6 pb-2">
          <Link href="/finance/rental-finances" className="text-white font-medium text-sm hover:text-white/80 transition-colors">
            &lt; Back
          </Link>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-white">Expense</div>
                <div className="text-lg text-white/80 font-medium">
                  {expense.transaction_type.name}
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-green-100 text-green-700 border border-green-200">
                  <span>{expense.status || 'Paid'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomButton
                isSecondary
                className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </CustomButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CustomButton isSecondary className="bg-transparent text-white border-white hover:bg-white hover:text-primary hover:border-white">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    More Actions
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </CustomButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Expense'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-6 mt-6">
          {/* Details Section */}
          <CollapsibleSection title="Details" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-primary font-medium">Date</div>
                  <div className="font-bold text-primary text-base">
                    {new Date(expense.transaction_date).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Employee</div>
                  <div className="font-bold text-primary text-base">{expense.employee_name}</div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Transaction Type</div>
                  <div className="font-bold text-primary text-base">{expense.transaction_type.name}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-primary font-medium">Amount</div>
                  <div className="font-bold text-primary text-base">
                    SAR {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Linked Invoice</div>
                  <div className="font-bold text-primary text-base hover:text-primary/80 cursor-pointer">
                    INV-123
                  </div>
                </div>
                <div>
                  <div className="text-sm text-primary font-medium">Method</div>
                  <div className="font-bold text-primary text-base">{expense.payment_method || 'Bank Transfer'}</div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Contract Details Section */}
          {expense.contract && (
            <CollapsibleSection title="Contract details" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Price</div>
                    <div className="font-bold text-primary text-base">SAR 1,450</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Start Date</div>
                    <div className="font-bold text-primary text-base">
                      {new Date(expense.contract.start_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">End Date</div>
                    <div className="font-bold text-primary text-base">
                      {new Date(expense.contract.end_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Created on</div>
                    <div className="font-bold text-primary text-base">
                      {new Date(expense.contract.created_at).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Tajeer Contract</div>
                    <div className="font-bold text-primary text-base hover:text-primary/80 cursor-pointer flex items-center gap-1">
                      {expense.contract.contract_number}
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Add-ons</div>
                    <div className="font-bold text-primary text-base hover:text-primary/80 cursor-pointer flex items-center gap-1">
                      3 Add-ons
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Supplier Details Section */}
          {expense.rental_expense?.vendor_name && (
            <CollapsibleSection title="Supplier details" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Name</div>
                    <div className="font-bold text-primary text-base">{expense.rental_expense.vendor_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Phone</div>
                    <div className="font-bold text-primary text-base">+966 55 123 4567</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Email</div>
                    <div className="font-bold text-primary text-base">garageinnovations@email.com</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Registration Number</div>
                    <div className="font-bold text-primary text-base">29057285</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Tax Number</div>
                    <div className="font-bold text-primary text-base">29837575</div>
                  </div>
                  {expense.rental_expense.receipt_number && (
                    <div>
                      <div className="text-sm text-primary font-medium">Receipt Number</div>
                      <div className="font-bold text-primary text-base">{expense.rental_expense.receipt_number}</div>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Customer Details Section */}
          {expense.customer && (
            <CollapsibleSection title="Customer details" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Customer Name</div>
                    <div className="font-bold text-primary text-base">{expense.customer.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Nationality</div>
                    <div className="font-bold text-primary text-base">{expense.customer.nationality_id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">ID Type</div>
                    <div className="font-bold text-primary text-base">{expense.customer.id_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">ID Number</div>
                    <div className="font-bold text-primary text-base">{expense.customer.id_number}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Classification</div>
                    <div className="font-bold text-primary text-base">{expense.customer.classification_id}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Mobile Number</div>
                    <div className="font-bold text-primary text-base">{expense.customer.mobile_number}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Date of Birth</div>
                    <div className="font-bold text-primary text-base">
                      {expense.customer.date_of_birth ? new Date(expense.customer.date_of_birth).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">License type</div>
                    <div className="font-bold text-primary text-base">Heavy Transport</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Address</div>
                    <div className="font-bold text-primary text-base">{expense.customer.address || 'Buraydah-Al Dhahi'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Membership</div>
                    <div className="font-bold text-primary text-base">{expense.customer.membership_tier || 'Gold'}</div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Vehicle Details Section */}
          {expense.vehicle && (
            <CollapsibleSection title="Vehicle details" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Serial Number</div>
                    <div className="font-bold text-primary text-base">343525315</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Plate</div>
                    <div className="font-bold text-primary text-base">{expense.vehicle.plate_number}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Plate registration type</div>
                    <div className="font-bold text-primary text-base">Private</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Year</div>
                    <div className="font-bold text-primary text-base">{expense.vehicle.make_year}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Model</div>
                    <div className="font-bold text-primary text-base">{expense.vehicle.model.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Make</div>
                    <div className="font-bold text-primary text-base">{expense.vehicle.make.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Color</div>
                    <div className="font-bold text-primary text-base">Black</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Age Range</div>
                    <div className="font-bold text-primary text-base">1-3 years</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-primary font-medium">Year of Manufacture</div>
                    <div className="font-bold text-primary text-base">{expense.vehicle.make_year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Mileage (km)</div>
                    <div className="font-bold text-primary text-base">28,914</div>
                  </div>
                  <div>
                    <div className="text-sm text-primary font-medium">Oil Expiry (km)</div>
                    <div className="font-bold text-primary text-base">5,901</div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Description Section */}
          <CollapsibleSection title="Description" defaultOpen={true}>
            <div>
              <div className="text-primary leading-relaxed">{expense.description}</div>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense transaction? This action cannot be undone.
              {expense && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Transaction Details:</p>
                  <p>Transaction Number: {expense.transaction_number}</p>
                  <p>Amount: SAR {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p>Date: {expense.transaction_date}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <CustomButton
              isSecondary
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Expense'}
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {expense && (
        <ExpenseForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSuccess}
          vehicles={vehicles}
          branches={branches}
          loading={false}
          isEdit={true}
          initialValues={{
            amount: expense.amount,
            date: expense.transaction_date,
            transactionType: expense.transaction_type?.id || '',
            vehicle: expense.vehicle?.id || '',
            branch: expense.branch?.id || '',
            employee: expense.employee_name || '',
            description: expense.description || '',
          }}
          transactionId={expense.id}
        />
      )}
    </div>
  );
}