import { PolkadotService } from './polkadot-service';

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
  filterImage: string;
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
      return await PolkadotService.getAllCampaigns();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Return mock data in case of error (development only)
      return this.getMockCampaigns();
    }
  }
  
  static async getCampaign(id: string): Promise<Campaign | null> {
    try {
      return await PolkadotService.getCampaign(id);
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      return null;
    }
  }
  
  static async createCampaign(campaign: {
    title: string;
    description: string;
    mainImage: string;
    filterImage: string;
    category: string;
    target: number;
    deadline: Date;
    filter: Filter;
    creatorName: string;
  }): Promise<string> {
    try {
      return await PolkadotService.createCampaign(
        campaign.title,
        campaign.description,
        campaign.target,
        campaign.deadline,
        campaign.mainImage,
        campaign.filterImage,
        campaign.creatorName,
        campaign.category,
        campaign.filter
      );
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }
  
  static async donateToCampaign(campaignId: string, amount: number): Promise<boolean> {
    try {
      return await PolkadotService.donateToCampaign(campaignId, amount);
    } catch (error) {
      console.error(`Error donating to campaign ${campaignId}:`, error);
      throw error;
    }
  }
  
  // Keep your mock campaigns for development and testing
  private static getMockCampaigns(): Campaign[] {
    // Your existing mock data...
    return [];
  }
}