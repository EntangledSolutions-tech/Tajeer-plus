import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { Badge } from '@kit/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';
import { Search, Filter, FileSpreadsheet, MoreVertical, Eye, Trash2, Pencil, Download, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import CustomButton from './CustomButton';
import { SimpleInput } from './CustomInput';
import { SimpleSelect } from './CustomSelect';
import { SimpleCheckbox } from './CustomCheckbox';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'status' | 'badge' | 'action' | 'link';
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

export interface TableAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick: (row: any, index: number) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  show?: (row: any) => boolean;
}

export interface CustomTableProps {
  // Data
  data: any[];
  columns: TableColumn[];

  // Configuration
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  tableBackground?: 'default' | 'transparent';

  // Styling
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;

  // Features
  selectable?: boolean;
  selectedRows?: string[];
  onRowSelect?: (rowId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;

  // Actions
  actions?: TableAction[];
  actionsColumn?: boolean;

  // Search and Filter
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Pagination
  pagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  currentLimit?: number;
  onLimitChange?: (limit: number) => void;

  // Sorting
  sortable?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;

  // Row interactions
  onRowClick?: (row: any, index: number) => void;
  hoverable?: boolean;

  // Status badges
  statusConfig?: {
    [key: string]: {
      [status: string]: {
        className: string;
        label?: string;
      };
    };
  };
}

export default function CustomTable({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  tableBackground = 'default',
  className = '',
  headerClassName = '',
  rowClassName = 'hover:bg-gray-50/50',
  cellClassName = 'text-dark-gray',
  selectable = false,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  actions = [],
  actionsColumn = true,
  searchable = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  currentLimit = 10,
  onLimitChange,
  sortable = false,
  sortColumn = '',
  sortDirection = 'asc',
  onSort,
  onRowClick,
  hoverable = true,
  statusConfig = {},
}: CustomTableProps) {

  const handleSort = (columnKey: string) => {
    if (!sortable || !onSort) return;

    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const renderCell = (column: TableColumn, value: any, row: any, index: number) => {
    if (column.render) {
      return column.render(value, row, index);
    }

    switch (column.type) {
      case 'currency':
        const currencyValue = Number(value);
        if (isNaN(currencyValue) || value === null || value === undefined) {
          return 'SAR 0';
        }
        return `SAR ${currencyValue.toLocaleString()}`;

      case 'number':
        const numberValue = Number(value);
        if (isNaN(numberValue) || value === null || value === undefined) {
          return '0';
        }
        return numberValue.toLocaleString();

      case 'date':
        return new Date(value).toLocaleDateString();

      case 'status':
      case 'badge':
        const statusKey = column.key;
        const statusValue = row[statusKey];
        const config = statusConfig[statusKey]?.[statusValue];

        if (config) {
          return (
            <Badge className={config.className}>
              {config.label || statusValue}
            </Badge>
          );
        }
        return <Badge>{statusValue}</Badge>;

      case 'link':
        return (
          <button
            className="text-primary hover:text-primary/80 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              // Handle link click if needed
            }}
          >
            {value}
          </button>
        );

      case 'action':
        return (
          <div className="flex gap-2">
            {actions.map((action) => {
              if (action.show && !action.show(row)) return null;

              return (
                <CustomButton
                  key={action.key}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  className={action.className}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    action.onClick(row, index);
                  }}
                >
                  {action.iconPosition === 'right' ? (
                    <>
                      {action.label}
                      {action.icon}
                    </>
                  ) : (
                    <>
                      {action.icon}
                      {action.label}
                    </>
                  )}
                </CustomButton>
              );
            })}
          </div>
        );

      default:
        return value;
    }
  };

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actionsColumn ? 1 : 0)} className="text-center py-8 text-muted-foreground">
        <div className="flex flex-col items-center">
          {emptyIcon || (
            <svg className="h-12 w-12 mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <h3 className="text-lg font-medium text-foreground mb-2">No data found</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className={`${tableBackground === 'transparent' ? 'bg-transparent' : 'bg-white'} overflow-x-auto ${className}`}>
      {/* Search Bar */}
      {searchable && onSearchChange && (
        <div className="p-4 border-b border-border">
          <SimpleInput
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="w-full"
            icon={<Search className="w-4 h-4" />}
            iconPosition="left"
          />
        </div>
      )}

      <div className="px-6">
        <Table className="bg-transparent">
        <TableHeader>
          <TableRow className={headerClassName}>
            {/* Select All Checkbox */}
            {selectable && (
              <TableHead className="w-12">
                <SimpleCheckbox
                  checked={selectedRows.length === data.length && data.length > 0}
                  onCheckedChange={(checked: boolean) => onSelectAll?.(checked)}
                  className="flex items-center justify-center"
                />
              </TableHead>
            )}

            {/* Column Headers */}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`font-medium text-dark-gray bg-transparent border-b border-gray-100`}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {sortable && column.sortable && (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="hover:text-primary transition-colors"
                    >
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? '↑' : '↓'
                      ) : (
                        '↕'
                      )}
                    </button>
                  )}
                </div>
              </TableHead>
            ))}

            {/* Actions Header */}
            {actionsColumn && actions.length > 0 && (
              <TableHead className={`font-medium text-dark-gray bg-transparent border-b border-gray-100 text-right`}>Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actionsColumn ? 1 : 0)} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            renderEmptyState()
          ) : (
            data.map((row, index) => (
              <TableRow
                key={row.id || index}
                className={`${rowClassName} ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row, index)}
              >
                {/* Row Selection Checkbox */}
                {selectable && (
                  <TableCell className="w-12">
                    <SimpleCheckbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={(checked: boolean) => onRowSelect?.(row.id, checked)}
                      className="flex items-center justify-center"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                  </TableCell>
                )}

                {/* Row Data */}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cellClassName}
                  >
                    {renderCell(column, row[column.key], row, index)}
                  </TableCell>
                ))}

                {/* Actions */}
                {actionsColumn && actions.length > 0 && (
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {actions.map((action) => {
                        if (action.show && !action.show(row)) return null;

                        return (
                          <TooltipProvider key={action.key}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CustomButton
                                  variant={action.variant || 'ghost'}
                                  size="sm"
                                  className={`${action.className} cursor-pointer`}
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    action.onClick(row, index);
                                  }}
                                >
                                  {action.iconPosition === 'right' ? (
                                    <>
                                      {action.label}
                                      {action.icon}
                                    </>
                                  ) : (
                                    <>
                                      {action.icon}
                                      {action.label}
                                    </>
                                  )}
                                </CustomButton>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{action.label || (action.key === 'edit' ? 'Edit' : action.key === 'delete' ? 'Delete' : action.key === 'view' ? 'View Details' : 'Action')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 0 && (
        <div className="flex items-center justify-center gap-4 py-4">
          {/* Previous button */}
          <CustomButton
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white text-dark-gray hover:bg-gray-50 cursor-pointer"
            disabled={currentPage <= 1}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </CustomButton>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;

              // Always show page numbers if totalPages <= maxVisiblePages
              if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <CustomButton
                      key={i}
                      variant="ghost"
                      size="sm"
                      className={`min-w-[40px] h-[40px] cursor-pointer ${
                        i === currentPage
                          ? 'bg-dark-gray text-white rounded-full'
                          : 'bg-transparent text-dark-gray hover:bg-gray-100 rounded-full'
                      }`}
                      onClick={() => onPageChange?.(i)}
                    >
                      {i}
                    </CustomButton>
                  );
                }
              } else {
                // Show first page
                pages.push(
                  <CustomButton
                    key={1}
                    variant="ghost"
                    size="sm"
                    className={`min-w-[40px] h-[40px] cursor-pointer ${
                      1 === currentPage
                        ? 'bg-dark-gray text-white rounded-full'
                        : 'bg-transparent text-dark-gray hover:bg-gray-100 rounded-full'
                    }`}
                    onClick={() => onPageChange?.(1)}
                  >
                    1
                  </CustomButton>
                );

                // Calculate visible range
                let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

                // Adjust if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages - 2) {
                  startPage = Math.max(2, endPage - (maxVisiblePages - 3) + 1);
                }

                // Add ellipsis after first page if needed
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis1" className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  );
                }

                // Add visible page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <CustomButton
                      key={i}
                      variant="ghost"
                      size="sm"
                      className={`min-w-[40px] h-[40px] cursor-pointer ${
                        i === currentPage
                          ? 'bg-dark-gray text-white rounded-full'
                          : 'bg-transparent text-dark-gray hover:bg-gray-100 rounded-full'
                      }`}
                      onClick={() => onPageChange?.(i)}
                    >
                      {i}
                    </CustomButton>
                  );
                }

                // Add ellipsis before last page if needed
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis2" className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  );
                }

                // Show last page
                pages.push(
                  <CustomButton
                    key={totalPages}
                    variant="ghost"
                    size="sm"
                    className={`min-w-[40px] h-[40px] cursor-pointer ${
                      totalPages === currentPage
                        ? 'bg-dark-gray text-white rounded-full'
                        : 'bg-transparent text-dark-gray hover:bg-gray-100 rounded-full'
                    }`}
                    onClick={() => onPageChange?.(totalPages)}
                  >
                    {totalPages}
                  </CustomButton>
                );
              }

              return pages;
            })()}
          </div>

          {/* Next button */}
          <CustomButton
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white text-dark-gray hover:bg-gray-50 cursor-pointer"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </CustomButton>

          {/* Rows per page */}
          <div className="flex items-center gap-2 ml-8">
            <span className="text-dark-gray text-sm">Rows per page</span>
            <SimpleSelect
              value={currentLimit.toString()}
              onChange={(value: string) => onLimitChange?.(parseInt(value))}
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' }
              ]}
              className="min-w-[80px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}