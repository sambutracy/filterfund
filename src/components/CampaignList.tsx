import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CanisterService } from '../services/canister';

// Import ICP-specific types
import type { Campaign as ICPCampaign } from '../services/canister';

// Define internal Campaign type for component use
type CampaignDisplay = {
  id: string;
  title: string;
  description: string;
  target?: bigint;
  amountCollected?: bigint;
  deadline?: bigint;
  mainImage?: string;
  creator?: string;
  creatorName?: string;
};

const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignDisplay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        // Fetch campaigns from the ICP campaign canister
        const icpCampaigns = await CanisterService.getAllCampaigns();
        
        // Map ICP campaign data to the format needed for display
        const displayCampaigns = icpCampaigns.map(campaign => ({
          id: campaign.id.toString(),
          title: campaign.title,
          description: campaign.description,
          target: campaign.target,
          amountCollected: campaign.amountCollected,
          deadline: campaign.deadline,
          mainImage: campaign.mainImage,
          creator: campaign.creator.toString(),
          creatorName: campaign.creatorName
        }));
        
        setCampaigns(displayCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns from ICP:', error);
        setError('Failed to load campaigns. Please try again later.');
        
        // Fallback to dummy data for development
        setCampaigns([
          { id: "1", title: "Campaign for Women's Rights", description: "Supporting women's empowerment initiatives." },
          { id: "2", title: "Campaign for Climate Action", description: "Promoting sustainable practices for our planet." },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <>
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Campaign list with motion animations */}
      {!isLoading && !error && (
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="campaign-list">
              {campaigns.map(campaign => (
                <motion.div
                  key={campaign.id}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="campaign-card">
                    <h3>{campaign.title}</h3>
                    <p>{campaign.description}</p>
                    {campaign.mainImage && (
                      <img 
                        src={campaign.mainImage} 
                        alt={campaign.title}
                        className="w-full h-48 object-cover rounded-md mt-4"
                      />
                    )}
                                        <div 
                      className="bg-gradient-to-r from-orange-500 to-lime-500 h-2 rounded-full progress-bar"
                      style={{ '--progress-width': `${Math.min(100, Number(campaign.amountCollected || 0) * 100 / Number(campaign.target || 1))}%` } as React.CSSProperties}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-8 mb-4">Active Campaigns</h2>
            {campaigns.length > 0 ? (
              campaigns.map(campaign => (
                <div key={campaign.id} className="campaign-item">
                  <div className="campaign-item-content">
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{campaign.description}</p>
                    {campaign.creatorName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Created by: {campaign.creatorName}
                      </p>
                    )}
                    <div className="mt-4 flex space-x-2">
                      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Try Filter
                      </button>
                      <button className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors">
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No campaigns available yet.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CampaignList;
