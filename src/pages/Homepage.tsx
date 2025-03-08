import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import DisplayCampaigns from '../components/DisplayCampaigns';
import FilterGrid from '../components/FilterGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { } from '../context';
// Import from our canister services
import { Campaign } from '../services/canister';
import { Filter } from '../services/api';
import { CanisterService } from '../services/canister';

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' or 'filters'
  const [error, setError] = useState<string | null>(null);
  

  // Use useCallback to prevent unnecessary re-renders
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use our CanisterService directly for better IC integration
      const data = await CanisterService.getAllCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For now we still use our mock API for filters
      // In the future, this would be integrated with IC as well
      const data = await CanisterService.getTopCampaigns(10);
      
      // Map campaigns to filters format for display
      const filtersFromCampaigns = data.map(campaign => ({
        id: campaign.id.toString(),
        title: campaign.title,
        image: campaign.mainImage,
        filterUrl: campaign.filter.filterUrl,
        category: getCategoryName(campaign.category),
        creator: campaign.creatorName,
        platform: campaign.filter.platform,
        instructions: campaign.filter.instructions
      }));
      
      setFilters(filtersFromCampaigns);
    } catch (error) {
      console.error("Error fetching filters:", error);
      setError("Failed to load AR filters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to get category name from CauseCategory variant
  const getCategoryName = (category: any): string => {
    // Detect which variant is present
    if ('Health' in category) return 'Health';
    if ('Education' in category) return 'Education';
    if ('Environment' in category) return 'Environment';
    if ('Equality' in category) return 'Equality';
    if ('Poverty' in category) return 'Poverty';
    if ('HumanRights' in category) return 'Human Rights';
    if ('AnimalWelfare' in category) return 'Animal Welfare';
    return 'Other';
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else if (activeTab === 'filters') {
      fetchFilters();
    }
  }, [activeTab, fetchCampaigns, fetchFilters]);

  // Map Campaign to the format expected by DisplayCampaigns
  const mapCampaignsToDisplay = (campaigns: Campaign[]) => {
    return campaigns.map(campaign => ({
      id: campaign.id.toString(),
      title: campaign.title,
      description: campaign.description,
      target: Number(campaign.target),
      deadline: Number(campaign.deadline),
      amountCollected: Number(campaign.amountCollected),
      image: campaign.mainImage,
      creator: campaign.creatorName
    }));
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-center mb-8 text-orange-600 dark:text-orange-400">
          FilterFund Community Hub
        </h1>
        
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
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <LoadingSpinner />
          </div>
        )}
        
        {/* Content based on active tab */}
        {!isLoading && activeTab === 'campaigns' && (
          <DisplayCampaigns 
            title="All Campaigns"
            isLoading={false}
            campaigns={mapCampaignsToDisplay(campaigns)}
          />
        )}
        
        {!isLoading && activeTab === 'filters' && (
          <>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-6">
              AR Filters Marketplace
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Browse and try AR filters created for social impact campaigns. Use these filters to spread awareness and support causes you care about.
            </p>
            <FilterGrid 
              filters={filters} 
              isLoading={false} 
            />
          </>
        )}
        
        {/* No Data Message */}
        {!isLoading && activeTab === 'campaigns' && campaigns.length === 0 && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-4">No Campaigns Available Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Be the first to create a campaign for a cause you care about!
              </p>
              <button
                onClick={() => window.location.href = '/create-campaign'}
                className="bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-6 py-3 rounded-lg transform transition hover:scale-105"
              >
                Create Campaign
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default HomePage;
