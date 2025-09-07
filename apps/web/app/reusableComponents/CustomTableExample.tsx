import React, { useState } from 'react';
import CustomTable, { TableColumn, TableAction } from './CustomTable';
import { Eye, Trash2, Pencil, Download } from 'lucide-react';

// Example data
const sampleData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Active',
    amount: 1500,
    date: '2024-01-15',
    contract: 'CON-001'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'Inactive',
    amount: 2300,
    date: '2024-01-10',
    contract: 'CON-002'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'Active',
    amount: 800,
    date: '2024-01-20',
    contract: 'CON-003'
  }
];

// Column definitions
const columns: TableColumn[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    sortable: true
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    width: '120px'
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'currency',
    align: 'right',
    sortable: true
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date',
    width: '120px'
  },
  {
    key: 'contract',
    label: 'Contract',
    type: 'link'
  }
];

// Status configuration
const statusConfig = {
  status: {
    'Active': {
      className: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      label: 'Active'
    },
    'Inactive': {
      className: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      label: 'Inactive'
    }
  }
};

// Actions
const actions: TableAction[] = [
  {
    key: 'view',
    label: 'View',
    icon: <Eye className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (row) => console.log('View', row)
  },
  {
    key: 'edit',
    label: 'Edit',
          icon: <Pencil className="w-4 h-4" />,
    variant: 'ghost',
    onClick: (row) => console.log('Edit', row)
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    variant: 'destructive',
    onClick: (row) => console.log('Delete', row)
  }
];

export default function CustomTableExample() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter data based on search
  const filteredData = sampleData.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Handle row selection
  const handleRowSelect = (rowId: string, selected: boolean) => {
    if (selected) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== rowId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(filteredData.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle sorting
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">CustomTable Examples</h2>

      {/* Basic Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Basic Table</h3>
        <CustomTable
          data={filteredData}
          columns={columns}
          statusConfig={statusConfig}
          actions={actions}
        />
      </div>

      {/* Table with Search */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Table with Search</h3>
        <CustomTable
          data={filteredData}
          columns={columns}
          statusConfig={statusConfig}
          actions={actions}
          searchable={true}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search customers..."
        />
      </div>

      {/* Table with Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Table with Row Selection</h3>
        <CustomTable
          data={filteredData}
          columns={columns}
          statusConfig={statusConfig}
          actions={actions}
          selectable={true}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
        />
        {selectedRows.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              Selected {selectedRows.length} row(s): {selectedRows.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Table with Sorting */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Table with Sorting</h3>
        <CustomTable
          data={filteredData}
          columns={columns}
          statusConfig={statusConfig}
          actions={actions}
          sortable={true}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Table with Pagination */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Table with Pagination</h3>
        <CustomTable
          data={filteredData.slice(0, 2)} // Show only 2 items for demo
          columns={columns}
          statusConfig={statusConfig}
          actions={actions}
          pagination={true}
          currentPage={currentPage}
          totalPages={2}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Table with Custom Styling */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Table with Custom Styling</h3>
        <CustomTable
          data={filteredData}
          columns={columns}
          statusConfig={statusConfig}
          actions={actions}
          className="border-2 border-blue-200"
          headerClassName="bg-blue-50 text-blue-900"
          rowClassName="hover:bg-blue-50"
          cellClassName="text-gray-700"
        />
      </div>

      {/* Table with Row Click */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Table with Row Click</h3>
        <CustomTable
          data={filteredData}
          columns={columns}
          statusConfig={statusConfig}
          onRowClick={(row) => alert(`Clicked on: ${row.name}`)}
        />
      </div>
    </div>
  );
}