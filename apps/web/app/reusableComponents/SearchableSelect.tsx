"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@kit/ui/select';
import { Label } from '@kit/ui/label';
import { Search, X } from 'lucide-react';
import { useField, useFormikContext } from 'formik';
import SearchBar from './SearchBar';

interface SearchableSelectProps {
  label: string;
  required?: boolean;
  name: string;
  options: CustomOption[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  searchPlaceholder?: string;
  multi?: boolean;
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  loadMoreText?: string;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
  // Backend search props
  enableBackendSearch?: boolean;
  onSearch?: (searchTerm: string) => Promise<void>;
  searchDebounceMs?: number;
}

interface CustomOption {
  key: string;
  id: string;
  value: string | React.ReactNode;
  subValue?: string | React.ReactNode;
}

// Simple Searchable Select without Formik
export const SimpleSearchableSelect = ({
  label,
  required = false,
  error,
  className = '',
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  readOnly = false,
  value,
  onChange,
  searchPlaceholder = 'Search...',
  multi = false,
  // Pagination props
  enablePagination = false,
  pageSize = 3,
  loadMoreText = 'Load More',
  onLoadMore,
  hasMore = false,
  loading = false,
  // Backend search props
  enableBackendSearch = false,
  onSearch,
  searchDebounceMs = 300,
  ...props
}: {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  options: CustomOption[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  searchPlaceholder?: string;
  multi?: boolean;
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  loadMoreText?: string;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
  // Backend search props
  enableBackendSearch?: boolean;
  onSearch?: (searchTerm: string) => Promise<void>;
  searchDebounceMs?: number;
  [key: string]: any;
}) => {
  const [filteredOptions, setFilteredOptions] = useState<CustomOption[]>(options);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<CustomOption[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert value to array for multi-select
  const valueArray = React.useMemo(() =>
    Array.isArray(value) ? value : value ? [value] : [],
    [value]
  );

  // Update filtered options when options change
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Set selected options when value changes
  useEffect(() => {
    if (valueArray.length > 0) {
      const selected = options.filter(opt => valueArray.includes(opt.id));
      setSelectedOptions(selected);
    } else {
      setSelectedOptions([]);
    }
  }, [valueArray, options]);

  // Load more options
  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || isLoadingMore) return;

    console.log('SearchableSelect: Load more clicked');
    setIsLoadingMore(true);
    try {
      await onLoadMore();
      console.log('SearchableSelect: Load more completed');
    } catch (error) {
      console.error('Error loading more options:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [onLoadMore, isLoadingMore]);

  // Filter options based on search term
  const filterOptions = useCallback((search: string) => {
    if (enableBackendSearch && onSearch) {
      // Backend search - clear timeout if exists
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set loading state
      setIsSearching(true);

      // Debounce the search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          await onSearch(search);
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          setIsSearching(false);
        }
      }, searchDebounceMs);
    } else {
      // Client-side search
      if (!search.trim()) {
        setFilteredOptions(options);
        return;
      }

      const filtered = options.filter(option => {
        const keyStr = typeof option.key === 'string' ? option.key : '';
        const valueStr = typeof option.value === 'string' ? option.value : '';
        const subValueStr = typeof option.subValue === 'string' ? option.subValue : '';

        return (
          keyStr.toLowerCase().includes(search.toLowerCase()) ||
          valueStr.toLowerCase().includes(search.toLowerCase()) ||
          subValueStr.toLowerCase().includes(search.toLowerCase())
        );
      });

      setFilteredOptions(filtered);
    }
  }, [options, enableBackendSearch, onSearch, searchDebounceMs]);

  // Memoize the handleSearchChange function
  const handleSearchChange = useCallback((searchValue: string) => {
    // Only update if the value actually changed
    if (searchValue !== searchTerm) {
      setSearchTerm(searchValue);
      filterOptions(searchValue);
    }
  }, [filterOptions, searchTerm]);

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
      console.log({optionValue})
    const option = options.find(opt => opt.id === optionValue);
    console.log('Found option:', option, 'from options:', options.map(o => ({id: o.id, value: o.value})));
    if (!option) return;

    if (multi) {
      // Multi-select logic
      const isSelected = selectedOptions.some(opt => opt.id === optionValue);
      let newSelectedOptions: CustomOption[];

      if (isSelected) {
        // Remove option if already selected
        newSelectedOptions = selectedOptions.filter(opt => opt.id !== optionValue);
      } else {
        // Add option if not selected
        newSelectedOptions = [...selectedOptions, option];
      }

      setSelectedOptions(newSelectedOptions);
      const newValues = newSelectedOptions.map(opt => opt.id);
      onChange?.(newValues);

      // Keep dropdown open for multi-select
      // Don't call setIsOpen(false)
    } else {
      // Single-select logic
      setSelectedOptions([option]);
      onChange?.(optionValue);
      setIsOpen(false);
    }

    setSearchTerm('');
    setFilteredOptions(options);
  };

  // Handle removing a selected option (multi-select only)
  const handleRemoveOption = (optionId: string) => {
    const newSelectedOptions = selectedOptions.filter(opt => opt.id !== optionId);
    setSelectedOptions(newSelectedOptions);
    const newValues = newSelectedOptions.map(opt => opt.id);
    onChange?.(newValues);
  };

  // Get display value for single select
  const getSingleDisplayValue = () => {
    if (selectedOptions.length > 0) {
      const option = selectedOptions[0];
      if (option) {
        return option.value;
      }
    }
    return placeholder;
  };

  // Get display value for multi select
  const getMultiDisplayValue = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }

    if (selectedOptions.length === 1) {
      const option = selectedOptions[0];
      if (option) {
        return option.value;
      }
    }

    return (
      <span className="text-sm text-primary/60">
        {selectedOptions.length} selected
      </span>
    );
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={props.id || props.name} className="block text-primary font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Select
        open={isOpen}
        onOpenChange={setIsOpen}
        value={multi ? '' : (Array.isArray(value) ? '' : (value || ''))}
        onValueChange={handleOptionSelect}
        disabled={disabled || readOnly}
      >
        <SelectTrigger
          className="w-full h-12 px-4 py-2 text-left bg-white border border-primary/30 rounded-lg shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-primary placeholder:text-primary/60"
          onKeyDown={(e) => {
            // Prevent typeahead search from interfering
            if (e.key !== 'Tab' && e.key !== 'Escape') {
              e.preventDefault();
            }
          }}
        >
          <div className="flex-1 text-left overflow-hidden">
            {multi ? getMultiDisplayValue() : getSingleDisplayValue()}
          </div>
        </SelectTrigger>

        <SelectContent className="border border-primary/30 rounded-lg shadow-lg max-h-80 w-[var(--radix-select-trigger-width)]">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              width="w-full"
              variant="white-bg"
            />
          </div>

          {/* Selected Options Display (Multi-select only) */}
          {multi && selectedOptions.length > 0 && (
            <div className="p-2 border-b border-gray-200">

              <div className="h-12  rounded overflow-hidden align-items-center">
                <div
                  className="flex gap-2 p-2 h-full overflow-x-scroll"
                  style={{
                    width: '100%',
                    minWidth: '100%',
                    overflowX:"auto",
                    alignItems:"center"
                  }}
                >
                  {selectedOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 bg-accent text-primary px-2 py-1 rounded-md text-sm whitespace-nowrap border border-primary/30 flex-shrink-0 h-8 min-w-fit"
                    >
                      <span className="max-w-32 truncate">{option.value}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(option.id)}
                        className="text-primary/60 hover:text-primary ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {(isSearching || loading) ? (
              <div className="p-3 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Loading...</span>
                </div>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => {
                  const isSelected = selectedOptions.some(opt => opt.id === option.id);
                  return (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className={`text-primary hover:bg-accent hover:text-primary focus:bg-accent focus:text-primary focus:outline-none cursor-pointer data-[highlighted]:bg-accent data-[highlighted]:text-primary ${
                        isSelected ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex-1">
                          <div className="font-medium">{option.value}</div>
                          {option.subValue && (
                            <div className="text-sm text-gray-500">{option.subValue}</div>
                          )}
                        </div>
                        {multi && isSelected && (
                          <span className="text-primary ml-auto">✓</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}

                {/* Load More Button */}
                {enablePagination && hasMore && !isSearching && (
                  <div className="p-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full py-2 px-3 text-sm text-primary hover:bg-accent hover:text-primary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingMore ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        loadMoreText
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </SelectContent>
      </Select>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Formik Searchable Select that uses SimpleSearchableSelect
const SearchableSelect = ({
  name,
  label,
  required = false,
  className = '',
  options,
  placeholder,
  disabled = false,
  readOnly = false,
  searchPlaceholder,
  multi = false,
  enablePagination = false,
  pageSize = 3,
  loadMoreText = 'Load More',
  onLoadMore,
  hasMore = false,
  loading = false,
  enableBackendSearch = false,
  onSearch,
  searchDebounceMs = 300,
  ...otherProps
}: SearchableSelectProps) => {
  const { setFieldValue } = useFormikContext();

  const handleChange = (value: string | string[]) => {
    setFieldValue(name, value);
  };

  const [field, meta] = useField(name);

  const configSelectField = {
    ...field,
    ...otherProps,
    onChange: handleChange,
    error: meta.touched && meta.error ? meta.error : undefined
  };

  return (
    <SimpleSearchableSelect
      {...configSelectField}
      label={label}
      required={required}
      className={className}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      value={field.value}
      onChange={handleChange}
      searchPlaceholder={searchPlaceholder}
      multi={multi}
      enablePagination={enablePagination}
      pageSize={pageSize}
      loadMoreText={loadMoreText}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
      enableBackendSearch={enableBackendSearch}
      onSearch={onSearch}
      searchDebounceMs={searchDebounceMs}
    />
  );
};

export default SearchableSelect;
