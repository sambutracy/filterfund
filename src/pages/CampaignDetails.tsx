import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const CampaignDetails: React.FC = () => {
  const { id } = useParams();

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div className="campaign-info">
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-4">
              Campaign Title
            </h1>
            {/* Campaign details */}
          </div>
          
          <div className="funding-section bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-lime-600 dark:text-lime-400 mb-4">
              Support this Campaign
            </h2>
            {/* Funding form */}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default CampaignDetails; 