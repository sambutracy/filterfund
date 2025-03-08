import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { IconContext } from 'react-icons';
import * as Icons from 'react-icons/fa';
import styles from '../styles/ProgressBar.module.css';

// Mock data
const userData = {
  name: "Alex Johnson",
  username: "@alexj",
  location: "San Francisco, CA",
  bio: "Passionate advocate for equality and social justice. Working on AR projects to create awareness.",
  followers: 245,
  following: 118,
  campaigns: 8
};

const userCampaigns = [
  {
    id: 1,
    title: "AR Awareness Walk",
    description: "Interactive AR experience highlighting gender pay gaps in downtown areas",
    image: "https://source.unsplash.com/random/300x200?ar",
    status: "active",
    participants: 34,
    progress: 68
  },
  {
    id: 2,
    title: "Virtual Equality Museum",
    description: "AR museum showcasing important milestones in the equality movement",
    image: "https://source.unsplash.com/random/300x200?museum",
    status: "active",
    participants: 89,
    progress: 42
  },
  {
    id: 3,
    title: "AR Education Series",
    description: "Educational AR content for schools about diversity and inclusion",
    image: "https://source.unsplash.com/random/300x200?education",
    status: "completed",
    participants: 156,
    progress: 100
  }
];

const Profile: React.FC = () => {
  return (
    <Layout>
      <IconContext.Provider value={{ className: 'react-icons' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 py-8"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-32 h-32 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full p-1">
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Icons.FaUser size={36} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mt-4">{userData.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400">{userData.username}</p>
                  <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400">
                    <Icons.FaMapMarkerAlt size={16} className="mr-1" />
                    <span>{userData.location}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {userData.bio}
                </p>

                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="font-bold text-xl">{userData.campaigns}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Campaigns</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="font-bold text-xl">{userData.followers}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="font-bold text-xl">{userData.following}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
                  </div>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                  My Campaigns
                </h2>
                <button className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-4 rounded-lg transition-colors">
                  New Campaign
                </button>
              </div>

              <div className="space-y-6">
                {userCampaigns.map(campaign => (
                  <motion.div 
                    key={campaign.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img 
                          className="h-48 w-full object-cover" 
                          src={campaign.image} 
                          alt={campaign.title} 
                        />
                      </div>
                      <div className="p-6 md:w-2/3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                              {campaign.title}
                            </h3>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-gray-500 hover:text-lime-500" title="Edit campaign" aria-label="Edit campaign">
                              <Icons.FaEdit size={16} />
                            </button>
                            <button className="text-gray-500 hover:text-red-500" title="Delete campaign" aria-label="Delete campaign">
                              <Icons.FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="mt-3 text-gray-600 dark:text-gray-300">
                          {campaign.description}
                        </p>
                        
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-sm font-medium text-lime-600 dark:text-lime-400">
                              {campaign.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-lime-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${campaign.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center">
                          <Icons.FaHeart size={16} className="text-red-500 mr-1" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {campaign.participants} participants
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </IconContext.Provider>
    </Layout>
  );
};

export default Profile;