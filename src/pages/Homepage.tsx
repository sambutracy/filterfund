import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import DisplayCampaigns from '../components/DisplayCampaigns';
import { useStateContext } from '../context';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  deadline: number;
  amountCollected: number;
  image: string;
  creator: string;
}

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const { address, contract, getCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DisplayCampaigns 
          title="All Campaigns"
          isLoading={isLoading}
          campaigns={campaigns}
        />
      </motion.div>
    </Layout>
  );
};

export default HomePage;
