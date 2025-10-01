import React from 'react';
import { cn } from '../lib/utils';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  showFilters?: boolean;
  onFilterClick?: () => void;
  filterCount?: number;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      onSearch,
      showFilters = true,
      onFilterClick,
      filterCount,
      placeholder = 'Search...',
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onSearch?.(e.target.value);
    };

    return (
      <div className={cn('w-full', className)}>
        <div className="relative flex items-center gap-3">
          {/* Search Icon */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              className={cn(
                'w-full h-12 pl-12 pr-4 text-sm',
                'bg-white border border-gray-200 rounded-xl',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'placeholder:text-gray-400',
                'transition-all duration-200'
              )}
              {...props}
            />
          </div>

          {/* Filters Button */}
          {showFilters && (
            <button
              onClick={onFilterClick}
              className={cn(
                'flex items-center gap-2 px-4 h-12 rounded-xl border transition-all',
                'hover:bg-gray-50',
                filterCount && filterCount > 0
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="text-sm font-medium">Filters</span>
              {filterCount && filterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary-500 text-white rounded-full">
                  {filterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
