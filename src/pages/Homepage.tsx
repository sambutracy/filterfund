import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import DisplayCampaigns from '../components/DisplayCampaigns';
import FilterGrid from '../components/FilterGrid';
import { useStateContext } from '../context';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  deadline: number;
  amountCollected: number;
  image: string;
  creator: string;
}

interface Filter {
  id: string;
  title: string;
  image: string;
  filterUrl: string;
  category: string;
  creator: string;
}

// Placeholder filters data
const PLACEHOLDER_FILTERS: Filter[] = [
  {
    id: '1',
    title: 'Women Empowerment Filter',
    image: 'https://via.placeholder.com/400x300/FF69B4/FFFFFF?text=Women+Empowerment',
    filterUrl: 'https://example.com/filter/1',
    category: 'Equality',
    creator: 'Jane Doe'
  },
  {
    id: '2',
    title: 'Climate Action Face Filter',
    image: 'https://via.placeholder.com/400x300/00CED1/FFFFFF?text=Climate+Action',
    filterUrl: 'https://example.com/filter/2',
    category: 'Environment',
    creator: 'John Smith'
  },
  {
    id: '3',
    title: 'Education For All',
    image: 'https://via.placeholder.com/400x300/FFD700/FFFFFF?text=Education',
    filterUrl: 'https://example.com/filter/3',
    category: 'Education',
    creator: 'Maria Garcia'
  },
  {
    id: '4',
    title: 'Healthcare Awareness',
    image: 'https://via.placeholder.com/400x300/FF6347/FFFFFF?text=Healthcare',
    filterUrl: 'https://example.com/filter/4',
    category: 'Health',
    creator: 'David Lee'
  }
];

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' or 'filters'
  
  const { address, contract, getCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === 'campaigns' 
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              activeTab === 'filters' 
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('filters')}
          >
            AR Filters
          </button>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'campaigns' && (
          <DisplayCampaigns 
            title="All Campaigns"
            isLoading={isLoading}
            campaigns={campaigns}
          />
        )}
        
        {activeTab === 'filters' && (
          <>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-6">
              AR Filters Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Browse and try AR filters created for social impact campaigns. Use these filters to spread awareness and support causes you care about.
            </p>
            <FilterGrid 
              filters={PLACEHOLDER_FILTERS} 
              isLoading={false} 
            />
          </>
        )}
      </motion.div>
    </Layout>
  );
};

export default HomePage;