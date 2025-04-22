import { initPolkadotApi } from './polkadot-api';
import { ApiPromise } from '@polkadot/api';

export interface Filter {
  platform: string;
  filterType: string;
  instructions: string;
  filterUrl: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  filterImage: string | null;
  category: string;
  target: bigint;
  amountCollected: bigint;
  isActive: boolean;
  creatorName: string;
  creator: string;
  deadline: bigint;
  filter: Filter;
}

export class CampaignService {
  static async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const api = await initPolkadotApi();
      
      // Check if campaign pallet exists on the connected chain
      if (!api.query.campaignPallet) {
        console.warn('Campaign pallet not found on this chain. Returning mock data.');
        return this.getMockCampaigns();
      }
      
      // Query your Polkadot smart contract/pallet
      const result = await api.query.campaignPallet.campaigns.entries();
      
      // Transform the data to match our Campaign interface
      return result.map(([key, value]) => {
        try {
          // Cast to any to avoid TypeScript errors when accessing properties
          const campaignData = value.toJSON ? value.toJSON() : value;
          
          // Check if campaignData is an object before accessing properties
          if (!campaignData || typeof campaignData !== 'object') {
            console.error('Invalid campaign data format:', campaignData);
            return null;
          }
          
          // Access data with safe type assertions
          const data = campaignData as Record<string, any>;
          
          // Safely extract values with fallbacks
          return {
            id: key.args?.[0]?.toString() || "unknown",
            title: this.getStringValue(data?.title),
            description: this.getStringValue(data?.description),
            mainImage: this.getStringValue(data?.mainImage),
            filterImage: this.getStringValue(data?.filterImage),
            category: this.getStringValue(data?.category),
            target: this.getBigIntValue(data?.target),
            amountCollected: this.getBigIntValue(data?.amountCollected),
            isActive: Boolean(data?.isActive),
            creatorName: this.getStringValue(data?.creatorName),
            creator: this.getStringValue(data?.creator),
            deadline: this.getBigIntValue(data?.deadline),
            filter: {
              platform: this.getStringValue(data?.filter?.platform),
              filterType: this.getStringValue(data?.filter?.filterType),
              instructions: this.getStringValue(data?.filter?.instructions),
              filterUrl: this.getStringValue(data?.filter?.filterUrl)
            }
          };
        } catch (error) {
          console.error('Error parsing campaign data:', error);
          return null;
        }
      }).filter(campaign => campaign !== null) as Campaign[];
    } catch (error) {
      console.error('Error fetching campaigns from Polkadot:', error);
      // Return mock data in case of error (development only)
      return this.getMockCampaigns();
    }
  }
  
  // Helper methods for safe value extraction
  private static getStringValue(value: any): string {
    if (value === undefined || value === null) return '';
    return typeof value.toString === 'function' ? value.toString() : String(value);
  }
  
  private static getBigIntValue(value: any): bigint {
    if (value === undefined || value === null) return BigInt(0);
    try {
      return BigInt(value.toString ? value.toString() : value);
    } catch {
      return BigInt(0);
    }
  }
  
  static async createCampaign(campaign: Omit<Campaign, 'id' | 'amountCollected' | 'isActive'>): Promise<string> {
    try {
      const api = await initPolkadotApi();
      
      // Check if the user has injected account (through extension)
      const accounts = await window.injectedWeb3?.['polkadot-js']?.enable('FilterFund AR Platform');
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect a wallet first.');
      }
      
      // Select the first account
      const account = accounts[0];
      
      // Create a transaction to create a campaign
      const tx = api.tx.campaignPallet.createCampaign(
        campaign.title,
        campaign.description,
        campaign.mainImage,
        campaign.filterImage || '',
        campaign.category,
        campaign.target.toString(),
        campaign.deadline.toString(),
        {
          platform: campaign.filter.platform,
          filterType: campaign.filter.filterType,
          instructions: campaign.filter.instructions,
          filterUrl: campaign.filter.filterUrl
        },
        campaign.creatorName
      );
      
      // Sign and send the transaction
      const result = await tx.signAndSend(account);
      
      // Return the campaign ID (this would ideally come from the chain event)
      return result.toString();
    } catch (error) {
      console.error('Error creating campaign on Polkadot:', error);
      throw error;
    }
  }
  
  static async donateToCampaign(campaignId: string, amount: number): Promise<void> {
    try {
      const api = await initPolkadotApi();
      
      // Check if the user has injected account
      const accounts = await window.injectedWeb3?.['polkadot-js']?.enable('FilterFund AR Platform');
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect a wallet first.');
      }
      
      // Select the first account
      const account = accounts[0];
      
      // Create a transaction to donate to a campaign
      const tx = api.tx.campaignPallet.donateToCampaign(
        campaignId,
        amount.toString()
      );
      
      // Sign and send the transaction
      await tx.signAndSend(account);
    } catch (error) {
      console.error('Error donating to campaign on Polkadot:', error);
      throw error;
    }
  }
  
  private static getMockCampaigns(): Campaign[] {
    return [
      {
        id: '1',
        title: 'AR Awareness Walk',
        description: 'Interactive AR experience highlighting gender pay gaps in downtown areas',
        mainImage: 'https://source.unsplash.com/random/300x200?ar',
        filterImage: null,
        category: 'Equality',
        target: BigInt(1000),
        amountCollected: BigInt(680),
        isActive: true,
        creatorName: 'Alex Johnson',
        creator: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        deadline: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
        filter: {
          platform: 'Instagram',
          filterType: 'Face Filter',
          instructions: 'Open Instagram camera and search for "AR Awareness"',
          filterUrl: 'https://example.com/filter/ar-awareness'
        }
      },
      {
        id: '2',
        title: 'Virtual Equality Museum',
        description: 'AR museum showcasing important milestones in the equality movement',
        mainImage: 'https://source.unsplash.com/random/300x200?museum',
        filterImage: null,
        category: 'Education',
        target: BigInt(2000),
        amountCollected: BigInt(840),
        isActive: true,
        creatorName: 'Maria Rodriguez',
        creator: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        deadline: BigInt(Date.now() + 60 * 24 * 60 * 60 * 1000),
        filter: {
          platform: 'Snapchat',
          filterType: 'World Filter',
          instructions: 'Open Snapchat and scan the QR code',
          filterUrl: 'https://example.com/filter/equality-museum'
        }
      }
    ];
  }
}