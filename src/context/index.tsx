import React, { createContext, useContext, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { PolkadotService } from '../services/polkadot-service';
import { connectWallet } from '../services/polkadot-api';

// Define Campaign interface locally if not exported elsewhere
interface Campaign {
  id: string;
  title: string;
  description: string;
  target: bigint;
  deadline: Date;
  amountCollected: number;
  mainImage: string;
  filterImage: string;
  creatorName: string;
  category: string;
  filter: {
    platform: string;
    filterUrl: string;
    filterType: string;
    instructions: string;
  };
}

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
      const campaigns = await PolkadotService.getAllCampaigns();
      return campaigns.map(campaign => ({
        ...campaign,
        deadline: new Date(campaign.deadline), // Convert number to Date
        amountCollected: Number(campaign.amountCollected) // Convert bigint to number
      }));
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
        BigInt(form.target),
        new Date(form.deadline).getTime(),
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

  const [transactionStatus, setTransactionStatus] = useState<{
    status: 'idle' | 'pending' | 'success' | 'error';
    message: string;
    txHash?: string;
  }>({ status: 'idle', message: '' });

  const donate = async (campaignId: string, amount: number): Promise<void> => {
    try {
      setTransactionStatus({ 
        status: 'pending', 
        message: 'Connecting to wallet...' 
      });
      
      // First ensure we have wallet connection
      await connectPolkadotWallet();
      
      setTransactionStatus({ 
        status: 'pending', 
        message: 'Please confirm the transaction in your wallet' 
      });
      
      // Execute donation
      const result = await PolkadotService.donateToCampaign(
        campaignId,
        amount
      );
      
      setTransactionStatus({ 
        status: 'success', 
        message: 'Donation successful!', 
        txHash: typeof result === 'string' ? result : undefined 
      });
      
      // Refresh campaign data
      await getCampaigns();
    } catch (error) {
      console.error('Error donating to campaign:', error);
      setTransactionStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to process donation' 
      });
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
