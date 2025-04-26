import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { PolkadotService, Filter, Campaign } from '../services/polkadot-service';
import DebugPanel from '../components/DebugPanel';

// Config object for environment settings
const config = {
  isDevelopment: process.env.NODE_ENV === 'development'
};

// Configure logging for debugging
const ENABLE_DEBUG_LOGGING = true;
const logDebug = (...args: any[]) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.log('[Homepage]', ...args);
  }
};

// Campaign card component for homepage
const CampaignCard: React.FC<{campaign: Campaign}> = ({ campaign }) => {
  const calculateProgress = (): number => {
    const target = Number(campaign.target);
    const collected = Number(campaign.amountCollected);
    
    if (target === 0) return 0;
    return Math.min(Math.round((collected / target) * 100), 100);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const progress = calculateProgress();
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      <img 
        src={campaign.mainImage || "/placeholder-campaign.jpg"} 
        alt={campaign.title}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {campaign.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {campaign.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium text-lime-600 dark:text-lime-400">{progress}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className={`progress-bar progress-${progress}`} 
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div>Target: {Number(campaign.target).toLocaleString()} DOT</div>
            <div>Ends: {formatDate(campaign.deadline)}</div>
          </div>
          
          <Link to={`/campaign/${campaign.id}`}>
            <button className="bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-4 py-2 rounded-lg text-sm">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Add this interface at the top of your file
interface FilterCardData {
  id: string;
  title: string;
  image: string;
  filterUrl: string;
  category: string;
  creator: string;
  platform: string;
  instructions: string;
  filterType: string; // Required by Filter interface
}

// Filter card component for homepage
const FilterCard: React.FC<{filter: FilterCardData}> = ({ filter }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="relative">
        <img 
          src={filter.image || "/placeholder-filter.jpg"} 
          alt={filter.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          {filter.platform}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {filter.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          by {filter.creator}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
            {filter.category}
          </span>
          
          <a href={filter.filterUrl} target="_blank" rel="noopener noreferrer">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm">
              Try Filter
            </button>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState<FilterCardData[]>([]);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' or 'filters'
  const [error, setError] = useState<string | null>(null);
  
  // Use useCallback to prevent unnecessary re-renders
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      logDebug("Fetching campaigns from Polkadot");
      // Use our PolkadotService directly
      const data = await PolkadotService.getAllCampaigns();
      logDebug(`Retrieved ${data.length} campaigns`);
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
      logDebug("Fetching filters (based on top campaigns)");
      // For filters, we'll use the top campaigns and convert them to filter format
      const data = await PolkadotService.getTopCampaigns(10);
      
      // Map campaigns to filters format for display
      const filtersFromCampaigns = data.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        image: campaign.mainImage,
        filterUrl: campaign.filter.filterUrl,
        category: campaign.category,
        creator: campaign.creatorName,
        platform: campaign.filter.platform,
        instructions: campaign.filter.instructions,
        filterType: campaign.filter.filterType // Add this missing field
      }));
      
      logDebug(`Converted ${filtersFromCampaigns.length} campaigns to filters`);
      setFilters(filtersFromCampaigns);
    } catch (error) {
      console.error("Error fetching filters:", error);
      setError("Failed to load AR filters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    } else if (activeTab === 'filters') {
      fetchFilters();
    }
  }, [activeTab, fetchCampaigns, fetchFilters]);

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
            <span className="ml-3">Loading...</span>
          </div>
        )}
        
        {/* Campaigns Tab Content */}
        {!isLoading && activeTab === 'campaigns' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Active Campaigns
              </h2>
              <Link to="/create-campaign">
                <button className="bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-6 py-2 rounded-lg shadow-md">
                  Create Campaign
                </button>
              </Link>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">No Campaigns Available Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Be the first to create a campaign for a cause you care about!
                </p>
                <Link to="/create-campaign">
                  <button className="bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-6 py-3 rounded-lg transform transition hover:scale-105">
                    Create Campaign
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Filters Tab Content */}
        {!isLoading && activeTab === 'filters' && (
          <>
            <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-6">
              AR Filters Marketplace
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Browse and try AR filters created for social impact campaigns. Use these filters to spread awareness and support causes you care about.
            </p>
            
            {filters.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">No Filters Available Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Filters will appear here as campaigns are created.
                </p>
                <Link to="/create-campaign">
                  <button className="bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-6 py-3 rounded-lg transform transition hover:scale-105">
                    Create Campaign with Filter
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filters.map((filter) => (
                  <FilterCard key={filter.id} filter={filter} />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {config.isDevelopment && (
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Developer Tools</h3>
          <DebugPanel />
        </div>
      )}
    </Layout>
  );
};

export default HomePage;