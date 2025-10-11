"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import CustomCard from '../reusableComponents/CustomCard';
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

type FilterType = 'all' | 'vehicles' | 'customers' | 'contracts';

export default function SearchPage() {
  const { getRequest } = useHttpService();
  const { selectedBranch } = useBranch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query.trim().length >= 2) {
      performSearch(query);
    }
  }, [query, selectedBranch]);

  useEffect(() => {
    // Filter results based on selected filter
    if (filter === 'all') {
      setFilteredResults(results);
    } else {
      const typeMap = {
        'vehicles': 'vehicle',
        'customers': 'customer',
        'contracts': 'contract'
      } as const;
      setFilteredResults(results.filter(result => result.type === typeMap[filter]));
    }
  }, [results, filter]);

  const performSearch = async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setFilteredResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    try {
      // Build search URL with optional branch filter
      const params = new URLSearchParams({
        q: searchTerm,
        limit: '50'
      });

      if (selectedBranch) {
        params.append('branch_id', selectedBranch.id);
      }

      const response = await getRequest(`/api/global-search?${params}`);

      if (response.success && response.data) {
        setResults(response.data.allResults || []);
        setTotalResults(response.data.totalResults || 0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setFilteredResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };


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
  };

  const getFilterCount = (type: FilterType) => {
    if (type === 'all') return totalResults;
    const typeMap = {
      'vehicles': 'vehicle',
      'customers': 'customer',
      'contracts': 'contract'
    } as const;
    return results.filter(result => result.type === typeMap[type]).length;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{totalResults} Search Results</h1>
        {query && (
          <p className="text-sm text-gray-300">
            Search Results for "{query}"
          </p>
        )}
      </div>

      {/* Radio Button Filters */}
      {results.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-6">
            {(['all', 'vehicles', 'customers', 'contracts'] as FilterType[]).map((filterType) => (
              <label key={filterType} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="filter"
                  value={filterType}
                  checked={filter === filterType}
                  onChange={() => setFilter(filterType)}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary accent-primary"
                />
                <span className="text-sm font-medium text-white capitalize">
                  {filterType === 'all' ? 'All' : filterType} ({getFilterCount(filterType)})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-300">Searching...</span>
        </div>
      ) : filteredResults.length === 0 && query ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
          <p className="text-gray-300">
            No results found for "{query}". Try adjusting your search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-5">
          {filteredResults.map((result) => (
            <CustomCard
              key={`${result.type}-${result.id}`}
              className="cursor-pointer"
              padding="sm"
              radius="lg"
              shadow="sm"
              hover={true}
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {result.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.badgeColor}`}>
                      {result.badge}
                    </span>
                    {result.status && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {result.status.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{result.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </CustomCard>
          ))}
        </div>
      )}

      {/* No search query state */}
      {!query && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">Start searching</h3>
          <p className="text-gray-300">
            Use the search bar in the header to find vehicles, customers, and contracts.
          </p>
        </div>
      )}
    </div>
  );
}
