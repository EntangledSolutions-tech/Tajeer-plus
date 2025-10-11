"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useHttpService } from '../../lib/http-service';
import { useBranch } from '../../contexts/branch-context';

interface SearchResult {
  id: string;
  type: 'vehicle' | 'customer' | 'contract';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  status?: any;
  data: any;
}

interface GlobalSearchDropdownProps {
  query: string;
  onClose: () => void;
  searchInputRef: React.RefObject<HTMLDivElement | null>;
}

export function GlobalSearchDropdown({ query, onClose, searchInputRef }: GlobalSearchDropdownProps) {
  const { getRequest } = useHttpService();
  const { selectedBranch } = useBranch();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position based on search input
  const updatePosition = () => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [searchInputRef, query]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        // Build search URL with optional branch filter
        const params = new URLSearchParams({
          q: query,
          limit: '3'
        });
        
        if (selectedBranch) {
          params.append('branch_id', selectedBranch.id);
        }

        const response = await getRequest(`/api/global-search?${params}`);

        if (response.success && response.data) {
          setResults(response.data.allResults || []);
          setHasMoreResults(response.data.hasMoreResults || false);
        } else {
          console.error('Search failed:', response.error);
          setResults([]);
          setHasMoreResults(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setHasMoreResults(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, selectedBranch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dropdownRef.current) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            const result = results[selectedIndex];
            if (result) {
              handleResultClick(result);
            }
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onClose]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'vehicle':
        router.push(`/vehicles/${result.id}`);
        break;
      case 'customer':
        router.push(`/customers/${result.id}`);
        break;
      case 'contract':
        router.push(`/contracts/${result.id}`);
        break;
    }
    onClose();
  };

  const handleViewAllClick = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const renderDropdown = () => {
    if (loading) {
      return (
        <div ref={dropdownRef} data-global-search-dropdown className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[99999] min-w-[400px]">
          <div className="p-4">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          </div>
        </div>
      );
    }

    if (results.length === 0 && query.trim().length >= 2) {
      return (
        <div ref={dropdownRef} data-global-search-dropdown className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[99999] min-w-[400px]">
          <div className="p-4">
            <div className="text-center py-4 text-gray-500">
              No results found for "{query}"
            </div>
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      return null;
    }

    return (
      <div ref={dropdownRef} data-global-search-dropdown className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[99999] min-w-[400px]">
        <div className="p-2">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleResultClick(result)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.badgeColor}`}>
                    {result.badge}
                  </span>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {result.subtitle}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </div>
          ))}

          {hasMoreResults && (
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleViewAllClick}
                className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                View all results
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Only render if we have a query and position is calculated
  if (!query.trim() || dropdownPosition.top === 0) {
    return null;
  }

      // Use portal to render at document root level
      return createPortal(
        <div
          data-global-search-dropdown
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, 400),
            zIndex: 99999
          }}
        >
          {renderDropdown()}
        </div>,
        document.body
      );
}
