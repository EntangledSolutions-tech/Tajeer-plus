import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  hexCode?: string; // For colors
  id?: string; // For IDs
  [key: string]: any; // Allow additional properties
}

export interface FilterSection {
  id: string;
  title: string;
  type: 'checkbox' | 'searchable-checkbox' | 'range' | 'toggle';
  options?: FilterOption[];
  searchPlaceholder?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  unit?: string;
  isExpanded?: boolean;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sections: FilterSection[];
  onClearAll: () => void;
  onShowResults: () => void;
  onSectionToggle?: (sectionId: string) => void;
  onFilterChange?: (sectionId: string, value: any) => void;
  selectedFilters?: Record<string, any>;
}

export default function FilterModal({
  isOpen,
  onClose,
  title = 'Filters',
  sections,
  onClearAll,
  onShowResults,
  onSectionToggle,
  onFilterChange,
  selectedFilters = {}
}: FilterModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.isExpanded).map(s => s.id))
  );
  const [sectionSearchTerms, setSectionSearchTerms] = useState<Record<string, string>>({});

  const handleSectionToggle = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    onSectionToggle?.(sectionId);
  };

  const handleFilterChange = (sectionId: string, value: any) => {
    onFilterChange?.(sectionId, value);
  };

  const handleSearchChange = (sectionId: string, value: string) => {
    setSectionSearchTerms(prev => ({ ...prev, [sectionId]: value }));
  };

  const getFilteredOptions = (section: FilterSection) => {
    if (section.type !== 'checkbox' && section.type !== 'searchable-checkbox') {
      return section.options || [];
    }

    const searchTerm = sectionSearchTerms[section.id] || '';
    if (!searchTerm) return section.options || [];

    return (section.options || []).filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderFilterContent = (section: FilterSection) => {
    const isExpanded = expandedSections.has(section.id);
    const filteredOptions = getFilteredOptions(section);
    const selectedValues = selectedFilters[section.id] || {};

    switch (section.type) {
      case 'checkbox':
      case 'searchable-checkbox':
        return (
          <div className="space-y-3">
            {section.type === 'searchable-checkbox' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={section.searchPlaceholder || `Search ${section.title.toLowerCase()}`}
                  value={sectionSearchTerms[section.id] || ''}
                  onChange={(e) => handleSearchChange(section.id, e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues[option.value] || false}
                    onChange={(e) => {
                      const newValues = { ...selectedValues };
                      newValues[option.value] = e.target.checked;
                      handleFilterChange(section.id, newValues);
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    {/* Show color swatch for color options */}
                    {section.id === 'colors' && option.hexCode && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: option.hexCode }}
                      />
                    )}
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </div>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
              {filteredOptions.length === 0 && sectionSearchTerms[section.id] && (
                <p className="text-sm text-gray-500 text-center py-2">No results found</p>
              )}
            </div>
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Min {section.unit || ''}</label>
                <input
                  type="number"
                  min={section.minValue}
                  max={section.maxValue}
                  step={section.step}
                  value={selectedValues.min || section.minValue || 0}
                  onChange={(e) => {
                    const newValues = { ...selectedValues, min: Number(e.target.value) };
                    handleFilterChange(section.id, newValues);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Max {section.unit || ''}</label>
                <input
                  type="number"
                  min={section.minValue}
                  max={section.maxValue}
                  step={section.step}
                  value={selectedValues.max || section.maxValue || 0}
                  onChange={(e) => {
                    const newValues = { ...selectedValues, max: Number(e.target.value) };
                    handleFilterChange(section.id, newValues);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable filter</span>
            <button
              type="button"
              onClick={() => {
                const newValue = !selectedValues.enabled;
                handleFilterChange(section.id, { enabled: newValue });
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                selectedValues.enabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  selectedValues.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={(e) => e.stopPropagation()}>
      {/* Left overlay with primary color */}
      <div className="flex-1 bg-primary/90 backdrop-blur-sm" onClick={onClose} />

      {/* Filter panel */}
      <div className="w-96 bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter sections */}
        <div className="flex-1 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div key={section.id} className="border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionToggle(section.id);
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{section.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-4" onClick={(e) => e.stopPropagation()}>
                    {renderFilterContent(section)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearAll();
            }}
            className="text-primary underline hover:text-primary/80 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowResults();
            }}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

