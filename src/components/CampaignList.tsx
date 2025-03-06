import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Campaign = {
  id: number;
  title: string;
  description: string;
};

const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // For now, use dummy data. Later, you can replace this with a call to your ICP backend.
    setCampaigns([
      { id: 1, title: "Campaign for Women's Rights", description: "Supporting women's empowerment initiatives." },
      { id: 2, title: "Campaign for Climate Action", description: "Promoting sustainable practices for our planet." },
    ]);
  }, []);

  return (
    <><motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="campaign-list"
    >
      {campaigns.map(campaign => (
        <motion.div
          key={campaign.id}
          className="campaign-card"
          whileHover={{ scale: 1.05 }}
        >
          <h3>{campaign.title}</h3>
          <p>{campaign.description}</p>
        </motion.div>
      ))}
    </motion.div><div>
        <h2>Active Campaigns</h2>
        {campaigns.length > 0 ? (
          campaigns.map(campaign => (
            <div key={campaign.id} className="campaign-item">
              <div key={campaign.id} className="campaign-item-content">
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
                {/* Future: Add buttons for "Try Filter", "Donate", etc. */}
              </div>
            </div>
          ))
        ) : (
          <p>No campaigns available yet.</p>
        )}
      </div></>
  );
};

export default CampaignList;
