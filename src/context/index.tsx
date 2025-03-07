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

// Mock API service to be replaced with your actual backend service
const mockApiService = {
  getCampaigns: async (): Promise<Campaign[]> => {
    // This would be replaced with your actual API call
    return [
      {
        id: '1',
        title: 'Women Empowerment Campaign',
        description: 'Supporting women\'s rights initiatives around the world.',
        target: 5000,
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        amountCollected: 2500,
        image: 'https://via.placeholder.com/400x300',
        creator: '0x12345...'
      },
      {
        id: '2',
        title: 'Environmental Protection',
        description: 'Cleaning up oceans and forests to preserve our planet.',
        target: 10000,
        deadline: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
        amountCollected: 3000,
        image: 'https://via.placeholder.com/400x300',
        creator: '0x67890...'
      }
    ];
  },
  createCampaign: async (campaign: any): Promise<void> => {
    console.log('Creating campaign:', campaign);
    // Implement actual API call here
  },
  donate: async (campaignId: string, amount: number): Promise<void> => {
    console.log(`Donating ${amount} to campaign ${campaignId}`);
    // Implement actual API call here
  },
  getUserCampaigns: async (): Promise<Campaign[]> => {
    // This would be replaced with your actual API call
    return [
      {
        id: '1',
        title: 'My Campaign',
        description: 'A campaign I created.',
        target: 5000,
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
        amountCollected: 2500,
        image: 'https://via.placeholder.com/400x300',
        creator: '0x12345...'
      }
    ];
  }
};

interface StateContextType {
  address: string | null;
  getCampaigns: () => Promise<Campaign[]>;
  createCampaign: (form: any) => Promise<void>;
  donate: (campaignId: string, amount: number) => Promise<void>;
  getUserCampaigns: () => Promise<Campaign[]>;
}

const StateContext = createContext<StateContextType | null>(null);

export const StateContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = usePrivy();
  
  const address = user?.wallet?.address || null;

  const getCampaigns = async (): Promise<Campaign[]> => {
    try {
      return await mockApiService.getCampaigns();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  };

  const createCampaign = async (form: any): Promise<void> => {
    try {
      await mockApiService.createCampaign(form);
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  const donate = async (campaignId: string, amount: number): Promise<void> => {
    try {
      await mockApiService.donate(campaignId, amount);
    } catch (error) {
      console.error('Error donating to campaign:', error);
      throw error;
    }
  };

  const getUserCampaigns = async (): Promise<Campaign[]> => {
    try {
      return await mockApiService.getUserCampaigns();
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      return [];
    }
  };

  return (
    <StateContext.Provider value={{
      address,
      getCampaigns,
      createCampaign,
      donate,
      getUserCampaigns,
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
