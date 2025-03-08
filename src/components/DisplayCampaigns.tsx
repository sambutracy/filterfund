import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  deadline: number;
  amountCollected: number;
  image: string;
  creator: string;
}

interface DisplayCampaignsProps {
  title: string;
  isLoading: boolean;
  campaigns: Campaign[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Adds delay between each child animation
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

const DisplayCampaigns: React.FC<DisplayCampaignsProps> = ({ title, isLoading, campaigns }) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Title with motion - using wrapper div with className */}
      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {title}
        </motion.div>
      </div>

      {/* Campaigns grid with motion - using wrapper div with className */}
      <div className="flex flex-wrap gap-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}
        >
          {isLoading && (
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}

          {!isLoading && campaigns.length === 0 && (
            <div className="text-gray-600 dark:text-gray-300 text-lg">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No campaigns found.
              </motion.div>
            </div>
          )}

          {!isLoading && campaigns.length > 0 && campaigns.map((campaign) => (
            <div 
              key={campaign.id}
              className="campaign-card w-full sm:w-[288px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              onClick={() => navigate(`/campaign/${campaign.id}`)}
            >
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="relative">
                  <div className="w-full h-[158px] overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img 
                        src={campaign.image} 
                        alt="campaign"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>

                  <div className="flex flex-col p-4">
                    <div className="block">
                      <h3 className="font-semibold text-[16px] text-orange-600 dark:text-orange-400 text-left leading-[26px] truncate">
                        {campaign.title}
                      </h3>
                      <p className="mt-[5px] font-normal text-gray-600 dark:text-gray-300 text-left leading-[18px] truncate">
                        {campaign.description}
                      </p>
                    </div>

                    <div className="flex justify-between mt-[15px] gap-2">
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-[14px] text-lime-600 dark:text-lime-400 leading-[22px]">
                          {campaign.amountCollected} ICP
                        </h4>
                        <p className="mt-[3px] font-normal text-[12px] text-gray-600 dark:text-gray-300 leading-[18px] sm:max-w-[120px] truncate">
                          Raised of {campaign.target}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-[14px] text-lime-600 dark:text-lime-400 leading-[22px]">
                          {new Date(campaign.deadline).toLocaleDateString()}
                        </h4>
                        <p className="mt-[3px] font-normal text-[12px] text-gray-600 dark:text-gray-300 leading-[18px] sm:max-w-[120px] truncate">
                          Days Left
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DisplayCampaigns;