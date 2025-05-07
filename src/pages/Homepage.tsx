import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { PolkadotService, Campaign } from '../services/polkadot-service';
import { calculateProgress } from '../utils/calculations';
import SkeletonCard from '../components/SkeletonCard';

// Configure logging only for development
const ENABLE_DEBUG_LOGGING = process.env.NODE_ENV === 'development';
const logDebug = (...args: any[]) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.log('[Homepage]', ...args);
  }
};

// Campaign card component for homepage
const CampaignCard: React.FC<{campaign: Campaign}> = ({ campaign }) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const progress = calculateProgress(Number(campaign.amountCollected), Number(campaign.target));
  const timeLeft = Math.max(0, Math.floor((Number(campaign.deadline) - Date.now()) / (1000 * 60 * 60 * 24)));
  const isEnding = timeLeft <= 7; // Ending soon if 7 days or less
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img 
          src={campaign.mainImage || "/placeholder-campaign.jpg"} 
          alt={campaign.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
            {campaign.category}
          </span>
        </div>
        {isEnding && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {timeLeft === 0 ? 'Ends today' : `${timeLeft} days left`}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {campaign.title}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          by {campaign.creatorName}
        </p>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
          {campaign.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Raised</span>
            <div className="flex items-center">
              <span className="font-medium text-red-600 dark:text-red-400">
                {Number(campaign.amountCollected).toLocaleString()} DOT
              </span>
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-500 dark:text-gray-400">
                {Number(campaign.target).toLocaleString()} DOT
              </span>
            </div>
          </div>
          
          {/* Updated ProgressBar with height as a string preset */}
          <ProgressBar 
            progress={progress} 
            height="thin" 
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(campaign.deadline)}
            </span>
          </div>
          
          <Link to={`/campaign/${campaign.id}`}>
            <button className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-4 py-2 rounded-lg text-sm">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Add this state

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
      const filtersFromCampaigns = data.map((campaign: Campaign) => ({
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
    const loadData = async () => {
      await fetchCampaigns();
      await fetchFilters();
      setIsLoading(false);
      setIsInitialLoad(false);
    };

    setIsLoading(true);
    loadData();
  }, [fetchCampaigns, fetchFilters]); // Add missing dependencies

  // Add this inside your component, before rendering
  // Sort campaigns to show the most funded ones first
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      return Number(b.amountCollected) - Number(a.amountCollected);
    });
  }, [campaigns]);

  return (
    <Layout>
      {isInitialLoad ? (
  <div className="flex justify-center items-center min-h-[300px]">
    <LoadingSpinner />
  </div>
) : (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center mb-8"
  >
    <h1 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-500 mb-3">
      Welcome to FilterFund
    </h1>
    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      Explore campaigns that combine AR filters with fundraising to make a real impact.
      Support initiatives that matter or create your own campaign today.
    </p>
  </motion.div>
)}

        {/* Stats section */}
        {!isLoading && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-red-600 dark:text-red-500">
        {campaigns.length}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Active Campaigns
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-red-600 dark:text-red-500">
        {filters.length}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        AR Filters
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-red-600 dark:text-red-500">
        {campaigns.reduce((sum, campaign) => sum + (Number(campaign.amountCollected) || 0), 0).toLocaleString()}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        DOT Collected
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-red-600 dark:text-red-500">
        {campaigns.filter(c => Number(c.deadline) > Date.now()).length}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Ending Soon
      </div>
    </div>
  </div>
)}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`py-3 px-6 font-medium relative ${
              activeTab === 'campaigns' 
                ? 'text-red-600 dark:text-red-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns
            {activeTab === 'campaigns' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 dark:bg-red-500"></span>
            )}
          </button>
          
          <button
            className={`py-3 px-6 font-medium relative ${
              activeTab === 'filters' 
                ? 'text-red-600 dark:text-red-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('filters')}
          >
            AR Filters
            {activeTab === 'filters' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 dark:bg-red-500"></span>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}
        
        {/* Campaigns Tab Content */}
        {!isLoading && activeTab === 'campaigns' && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <CampaignCard campaign={campaign} />
              </motion.div>
            ))}
          </div>
        )}

        {/* If there are no campaigns */}
        {!isLoading && activeTab === 'campaigns' && campaigns.length === 0 && (
  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
      No Campaigns Yet
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">
      Be the first to create a campaign and start raising funds for your cause.
    </p>
    <Link to="/create-campaign">
      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
        Create Campaign
      </button>
    </Link>
  </div>
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

    {/* Call to action section */}
    <div className="mt-12 bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-700 dark:to-rose-600 text-white rounded-xl p-8 text-center">
      <h3 className="text-2xl font-bold mb-3">Ready to Start Your Campaign?</h3>
      <p className="mb-6 max-w-xl mx-auto">
        Create a campaign, connect it with an AR filter, and start making a difference today.
      </p>
      <Link to="/create-campaign">
        <button className="bg-white text-red-600 font-medium px-6 py-3 rounded-lg hover:bg-red-50 transition-colors">
          Start Your Campaign
        </button>
      </Link>
    </div>
  </Layout>
  );
};

export default HomePage;