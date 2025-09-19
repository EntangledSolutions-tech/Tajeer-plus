"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { SimpleInput } from '../reusableComponents/CustomInput';

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
  }, [query]);

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
      const response = await fetch(`/api/global-search?q=${encodeURIComponent(searchTerm)}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setResults(data.allResults || []);
        setTotalResults(data.totalResults || 0);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
            {query && (
              <p className="text-gray-600 mt-1">
                {totalResults} results for "{query}"
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
            <SimpleInput
              placeholder="Search vehicles, customers, contracts..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </div>

        {/* Filters */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by type:</span>
            </div>
            <div className="flex gap-2">
              {(['all', 'vehicles', 'customers', 'contracts'] as FilterType[]).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterType} ({getFilterCount(filterType)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Searching...</span>
            </div>
          </div>
        ) : filteredResults.length === 0 && query ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                No results found for "{query}". Try adjusting your search terms.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {result.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.badgeColor}`}>
                        {result.badge}
                      </span>
                      {result.status && (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: result.status.color + '20', color: result.status.color }}
                        >
                          {result.status.name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{result.subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No search query state */}
        {!query && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-600">
                Enter a search term above to find vehicles, customers, and contracts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
