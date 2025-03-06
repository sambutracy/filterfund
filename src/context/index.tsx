import React, { createContext, useContext, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

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

interface Contract {
  getCampaigns: () => Promise<Campaign[]>;
  // Add other contract methods here
}

interface StateContextType {
  address: string | null;
  contract: Contract | null;
  getCampaigns: () => Promise<Campaign[]>;
  createCampaign: (form: any) => Promise<void>;
  donate: (campaignId: string, amount: number) => Promise<void>;
  getUserCampaigns: () => Promise<Campaign[]>;
}

const StateContext = createContext<StateContextType | null>(null);

export const StateContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = usePrivy();
  const [contract, setContract] = useState<Contract | null>(null);

  const address = user?.wallet?.address || null;

  const getCampaigns = async (): Promise<Campaign[]> => {
    try {
      if (!contract) return [];
      const campaigns = await contract.getCampaigns();
      return campaigns;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  };

  // Add other contract functions here

  return (
    <StateContext.Provider value={{
      address,
      contract,
      getCampaigns,
      createCampaign: async () => {},
      donate: async () => {},
      getUserCampaigns: async () => [],
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error('useStateContext must be used within a StateContextProvider');
  return context;
}; 