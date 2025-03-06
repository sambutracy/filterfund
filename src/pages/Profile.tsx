import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const Profile: React.FC = () => {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">
                Profile
              </h2>
              {/* Profile info */}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-lime-600 dark:text-lime-400 mb-4">
              My Campaigns
            </h2>
            {/* List of user's campaigns */}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile; 