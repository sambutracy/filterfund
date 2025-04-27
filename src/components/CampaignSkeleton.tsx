// src/components/CampaignSkeleton.tsx
import React from 'react';

const CampaignSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
      
      <div className="p-5">
        {/* Title placeholder */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        
        {/* Description placeholder */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        
        {/* Progress bar placeholder */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        
        {/* Footer placeholder */}
        <div className="flex justify-between">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default CampaignSkeleton;