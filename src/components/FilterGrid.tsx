// src/components/FilterGrid.tsx
import React from 'react';
import FilterCard from './FilterCard';
import { Filter } from '../services/api';

interface FilterGridProps {
  filters: Filter[];
  isLoading: boolean;
}

const FilterGrid: React.FC<FilterGridProps> = ({ filters, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (filters.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-600 dark:text-gray-300">
          No filters available yet. Be the first to create one!
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filters.map(filter => (
        <FilterCard 
          key={filter.id}
          id={filter.id}
          title={filter.title}
          image={filter.image}
          filterUrl={filter.filterUrl}
          category={filter.category}
          creator={filter.creator}
        />
      ))}
    </div>
  );
};

export default FilterGrid;