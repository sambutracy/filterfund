import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CampaignService, Campaign } from '../services/campaign-service';
import './CampaignList.css';
import CampaignSkeleton from './CampaignSkeleton';

const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        // Fetch campaigns from Polkadot
        const polkadotCampaigns = await CampaignService.getAllCampaigns();
        setCampaigns(polkadotCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns from Polkadot:', error);
        setError('Failed to load campaigns. Please try again later.');
        
        // Fallback to dummy data for development
        setCampaigns([
          { 
            id: "1", 
            title: "Campaign for Women's Rights", 
            description: "Supporting women's empowerment initiatives.",
            mainImage: "https://placekitten.com/800/400",
            filterImage: "",
            category: "Equality",
            target: BigInt(10000),
            amountCollected: BigInt(5000),
            isActive: true,
            creatorName: "Jane Doe",
            creator: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            deadline: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
            donations: [],
            filter: {
              platform: "Instagram",
              filterType: "Face Filter",
              instructions: "Open Instagram camera and search for filter",
              filterUrl: "https://example.com/filter/womens-rights"
            }
          },
          { 
            id: "2", 
            title: "Campaign for Climate Action", 
            description: "Promoting sustainable practices for our planet.",
            mainImage: "https://placekitten.com/800/401",
            filterImage: "",
            category: "Environment",
            target: BigInt(15000),
            amountCollected: BigInt(7500),
            isActive: true,
            creatorName: "John Smith",
            creator: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
            deadline: BigInt(Date.now() + 60 * 24 * 60 * 60 * 1000),
            donations: [],
            filter: {
              platform: "Snapchat",
              filterType: "World Filter",
              instructions: "Open Snapchat and scan this QR code",
              filterUrl: "https://example.com/filter/climate-action"
            }
          }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <CampaignSkeleton key={index} />
          ))}
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
                      <>
                        <img
                          src={campaign.mainImage}
                          alt={campaign.title}
                          className="w-full h-48 object-cover rounded-md mt-4" 
                        />
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            data-progress={Math.min(100, Math.round(Number(campaign.amountCollected) * 100 / Number(campaign.target)))}
                          ></div>
                        </div>
                      </>
                    )}
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
