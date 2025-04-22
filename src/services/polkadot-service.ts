import { ApiPromise } from '@polkadot/api';
import { web3FromSource } from '@polkadot/extension-dapp';
import { initPolkadotApi } from './polkadot-api';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface FilterDetails {
  platform: string;
  filterUrl: string;
  filterType: string;
  instructions: string;
}

export interface Filter {
  id: string;
  title: string;
  image: string;
  filterUrl: string;
  category: string;
  creator: string;
  platform: string;
  instructions: string;
}

export interface Donation {
  donor: string;
  amount: number;
  timestamp: number;
  message: string | null;
  isAnonymous: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  deadline: number;
  amountCollected: number;
  mainImage: string;
  filterImage: string | null;
  category: string;
  creator: string;
  creatorName: string;
  filter: FilterDetails;
  isActive: boolean;
  donations: Donation[];
}

export class PolkadotService {
  /**
   * Uploads an asset (image) to IPFS or other storage connected to Polkadot
   * @param file File to upload
   * @param type Type of asset (MainImage or FilterImage)
   * @returns URL of the uploaded asset
   */
  static async uploadAsset(file: File, type: string): Promise<string> {
    // For actual implementation, you'll need:
    // 1. Upload to IPFS or other storage service
    // 2. Get CID/URL from the response
    // 3. Return URL

    // Simulate upload with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, replace with actual IPFS upload
        // This is a mock URL based on file name and random ID
        const mockCid = `${type.toLowerCase()}-${uuidv4().slice(0, 8)}`;
        const fileName = encodeURIComponent(file.name.replace(/\s+/g, '-').toLowerCase());
        const mockUrl = `https://ipfs.example.com/ipfs/${mockCid}/${fileName}`;
        
        console.log(`[PolkadotService] Uploaded ${type} to: ${mockUrl}`);
        resolve(mockUrl);
      }, 800); // Simulate network delay
    });
  }

  /**
   * Creates a new campaign on the Polkadot blockchain
   */
  static async createCampaign(
    title: string,
    description: string,
    target: number,
    deadline: Date,
    mainImage: string,
    filterImage: string | null,
    creatorName: string,
    category: string,
    filterDetails: FilterDetails
  ): Promise<string> {
    try {
      const api = await initPolkadotApi();
      
      // Get the current connected account from Polkadot extension
      const accounts = await web3FromSource('polkadot-js');
      if (!accounts || !accounts.signer) {
        throw new Error('No signer available. Please connect your Polkadot wallet.');
      }
      
      // In a real implementation, you would:
      // 1. Create a transaction to call the campaign-management pallet
      // 2. Wait for the transaction to be included in a block
      // 3. Return the campaign ID
      
      // For now, we'll simulate with a mock implementation
      console.log('[PolkadotService] Creating campaign:', {
        title,
        description,
        target,
        deadline,
        mainImage,
        filterImage,
        creatorName,
        category,
        filterDetails
      });
      
      // Simulate network delay and return a mock campaign ID
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `campaign-${uuidv4().substring(0, 8)}`;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }
  
  /**
   * Gets all campaigns from the Polkadot blockchain
   */
  static async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const api = await initPolkadotApi();
      
      // In a real implementation, you would:
      // 1. Query the campaign-management pallet for all campaigns
      // 2. Transform the data to match the Campaign interface
      
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate 5 mock campaigns
      return Array.from({ length: 5 }).map((_, i) => ({
        id: `campaign-${i+1}`,
        title: `Example Campaign ${i+1}`,
        description: "This is a mock campaign description for testing the Polkadot integration.",
        target: 5000,
        amountCollected: Math.floor(Math.random() * 5000),
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        mainImage: `https://picsum.photos/seed/${i}/800/450`,
        filterImage: `https://picsum.photos/seed/filter${i}/200/200`,
        category: ["Education", "Health", "Environment", "Equality", "Poverty"][i % 5],
        creator: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // Mock Polkadot address
        creatorName: `Creator ${i+1}`,
        isActive: true,
        donations: Array.from({ length: Math.floor(Math.random() * 5) }).map((_, j) => ({
          donor: `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty${j}`,
          amount: Math.floor(Math.random() * 1000),
          timestamp: Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000),
          message: Math.random() > 0.5 ? "Good luck with your campaign!" : null,
          isAnonymous: Math.random() > 0.7
        })),
        filter: {
          platform: ["Snapchat", "Instagram", "TikTok", "Facebook"][i % 4],
          filterUrl: `https://example.com/filter/${i+1}`,
          filterType: "Face Filter",
          instructions: "Open the app and scan this QR code to try the filter."
        }
      }));
    } catch (error) {
      console.error('Error fetching campaigns from Polkadot:', error);
      throw error;
    }
  }
  
  /**
   * Gets a specific campaign by ID
   */
  static async getCampaign(campaignId: string): Promise<Campaign | null> {
    try {
      const api = await initPolkadotApi();
      
      // In a real implementation, you would:
      // 1. Query the campaign-management pallet for the specific campaign
      
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate a mock campaign for the given ID
      const i = parseInt(campaignId.replace('campaign-', '')) || 1;
      
      return {
        id: campaignId,
        title: `Example Campaign ${i}`,
        description: "This is a mock campaign description for testing the Polkadot integration. This campaign aims to raise awareness about important social issues through creative AR filters.",
        target: 5000,
        amountCollected: Math.floor(Math.random() * 5000),
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        mainImage: `https://picsum.photos/seed/${i}/800/450`,
        filterImage: `https://picsum.photos/seed/filter${i}/200/200`,
        category: ["Education", "Health", "Environment", "Equality", "Poverty"][i % 5],
        creator: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // Mock Polkadot address
        creatorName: `Creator ${i}`,
        isActive: true,
        donations: Array.from({ length: Math.floor(Math.random() * 5) }).map((_, j) => ({
          donor: `5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty${j}`,
          amount: Math.floor(Math.random() * 1000),
          timestamp: Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000),
          message: Math.random() > 0.5 ? "Good luck with your campaign!" : null,
          isAnonymous: Math.random() > 0.7
        })),
        filter: {
          platform: ["Snapchat", "Instagram", "TikTok", "Facebook"][i % 4],
          filterUrl: `https://example.com/filter/${i}`,
          filterType: "Face Filter",
          instructions: "Open the app and scan this QR code to try the filter."
        }
      };
    } catch (error) {
      console.error('Error fetching campaign from Polkadot:', error);
      throw error;
    }
  }
  
  /**
   * Donates to a campaign
   */
  static async donateToCampaign(
    campaignId: string,
    amount: number,
    message: string | null,
    isAnonymous: boolean
  ): Promise<boolean> {
    try {
      const api = await initPolkadotApi();
      
      // In a real implementation, you would:
      // 1. Connect to the user's wallet
      // 2. Create a transaction to call the donate function in the campaign-management pallet
      // 3. Sign and send the transaction
      
      console.log(`[PolkadotService] Donating ${amount} DOT to campaign ${campaignId}`);
      console.log(`Message: ${message}, Anonymous: ${isAnonymous}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error donating to campaign:', error);
      throw error;
    }
  }
  
  /**
   * Gets top campaigns for featured filters
   */
  static async getTopCampaigns(limit: number): Promise<Campaign[]> {
    try {
      const allCampaigns = await this.getAllCampaigns();
      
      // Sort by amount collected and return top campaigns
      return allCampaigns
        .sort((a, b) => b.amountCollected - a.amountCollected)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top campaigns:', error);
      throw error;
    }
  }
}