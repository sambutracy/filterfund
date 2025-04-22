// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { UserIcon, MapIcon, EditIcon, TrashIcon, HeartIcon } from '../components/Icons';
import ProgressBar from '../components/ProgressBar';
import { CampaignService, Campaign } from '../services/campaign-service';
import { useStateContext } from '../context';
import { usePrivy } from '@privy-io/react-auth';
import Notification from '../components/Notification';

const Profile: React.FC = () => {
  const { user } = usePrivy();
  const { address, connectPolkadotWallet } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  // Get user data
  const userData = {
    name: user?.email?.address?.split('@')[0] || "Anonymous User",
    username: address ? `@${address.substring(0, 4)}...${address.substring(address.length - 4)}` : "@anon",
    location: "Not specified",
    bio: "No bio provided yet.",
    followers: 0,
    following: 0,
    campaigns: userCampaigns.length
  };

  useEffect(() => {
    const fetchUserCampaigns = async () => {
      setIsLoading(true);
      try {
        if (address) {
          const allCampaigns = await CampaignService.getAllCampaigns();
          // Filter campaigns created by this user
          const filteredCampaigns = allCampaigns.filter(
            campaign => campaign.creator === address
          );
          setUserCampaigns(filteredCampaigns);
        }
      } catch (error) {
        console.error('Error fetching user campaigns:', error);
        showNotification('Failed to load your campaigns', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCampaigns();
  }, [address]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, isVisible: true });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleConnectWallet = async () => {
    try {
      await connectPolkadotWallet();
      showNotification('Wallet connected successfully', 'success');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      showNotification('Failed to connect wallet. Please try again.', 'error');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Notification 
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={closeNotification}
        />

        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.name}</h1>
                {!address ? (
                  <button 
                    onClick={handleConnectWallet}
                    className="mt-2 md:mt-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{userData.username}</span>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
                <MapIcon className="w-4 h-4 mr-1" />
                <span>{userData.location}</span>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">{userData.bio}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{userData.followers}</span> Followers
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{userData.following}</span> Following
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{userData.campaigns}</span> Campaigns
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Campaigns Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Campaigns</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your campaigns...</p>
            </div>
          ) : userCampaigns.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any campaigns yet.</p>
              <a href="/create-campaign" className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Create Your First Campaign
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCampaigns.map(campaign => (
                <motion.div 
                  key={campaign.id.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <img 
                    src={campaign.mainImage || `https://source.unsplash.com/random/300x200?${campaign.title.split(' ')[0].toLowerCase()}`} 
                    alt={campaign.title} 
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${campaign.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {campaign.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{campaign.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.round((Number(campaign.amountCollected) / Number(campaign.target)) * 100)}%
                        </span>
                      </div>
                      <ProgressBar progress={Math.round((Number(campaign.amountCollected) / Number(campaign.target)) * 100)} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <a 
                        href={`/campaign/${campaign.id}`}
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                      >
                        View Details
                      </a>
                      
                      <div className="flex gap-2">
                        <button 
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Edit campaign"
                          aria-label="Edit campaign"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button 
                          className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Delete campaign"
                          aria-label="Delete campaign"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;