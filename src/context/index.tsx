import React, { createContext, useContext } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { PolkadotService, Campaign } from '../services/polkadot-service';
import { connectWallet } from '../services/polkadot-api';

interface StateContextType {
  address: string | null;
  getCampaigns: () => Promise<Campaign[]>;
  createCampaign: (form: any) => Promise<void>;
  donate: (campaignId: string, amount: number) => Promise<void>;
  connectPolkadotWallet: () => Promise<any>;
}

const StateContext = createContext<StateContextType | null>(null);

export const StateContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = usePrivy();
  
  const address = user?.wallet?.address || null;

  const getCampaigns = async (): Promise<Campaign[]> => {
    try {
      return await PolkadotService.getAllCampaigns();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  };

  const createCampaign = async (form: any): Promise<void> => {
    try {
      await PolkadotService.createCampaign(
        form.title,
        form.description,
        Number(form.target),
        new Date(form.deadline),
        form.mainImage,
        form.filterImage,
        form.creatorName,
        form.category,
        {
          platform: form.filterPlatform,
          filterUrl: form.filterUrl,
          filterType: form.filterType,
          instructions: form.filterInstructions
        }
      );
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  const donate = async (campaignId: string, amount: number): Promise<void> => {
    try {
      await PolkadotService.donateToCampaign(
        campaignId,
        amount,
        null, // message
        false // isAnonymous
      );
    } catch (error) {
      console.error('Error donating to campaign:', error);
      throw error;
    }
  };

  const connectPolkadotWallet = async () => {
    try {
      const accounts = await connectWallet();
      return accounts;
    } catch (error) {
      console.error('Error connecting Polkadot wallet:', error);
      throw error;
    }
  };

  const contextValue = {
    address,
    getCampaigns,
    createCampaign,
    donate,
    connectPolkadotWallet
  };

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error('useStateContext must be used within a StateContextProvider');
  }
  return context;
};
