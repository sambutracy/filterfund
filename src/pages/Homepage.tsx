import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import DisplayCampaigns from '../components/DisplayCampaigns';
import FilterGrid from '../components/FilterGrid';
import { useStateContext } from '../context';
import API, { Campaign, Filter } from '../services/api';

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' or 'filters'
  
  const { address, getCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // Use the context's getCampaigns method which now uses our mock API
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const data = await API.getFilters();
      setFilters(data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else if (activeTab === 'filters') {
      fetchFilters();
    }
  }, [activeTab, address]);

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
            campaigns={campaigns.map(campaign => ({
              id: campaign.id,
              title: campaign.title,
              description: campaign.description,
              target: campaign.target,
              deadline: campaign.deadline,
              amountCollected: campaign.amountCollected,
              image: campaign.image,
              creator: campaign.creator
            }))}
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
              filters={filters} 
              isLoading={isLoading} 
            />
          </>
        )}
      </motion.div>
    </Layout>
  );
};

export default HomePage;