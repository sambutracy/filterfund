// src/components/FilterCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface FilterCardProps {
  id: string;
  title: string;
  image: string;
  filterUrl: string;
  category: string;
  creator: string;
}

const FilterCard: React.FC<FilterCardProps> = ({ 
  id, 
  title, 
  image, 
  filterUrl, 
  category,
  creator 
}) => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-video">
        <img 
          src={image || "/placeholder.jpg"} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Created by {creator}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            {/* QR code placeholder - will be implemented with a QR library */}
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              QR
            </div>
          </div>
          
          <button className="bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-4 py-2 rounded-lg transform transition hover:scale-105">
            Try Filter
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterCard;