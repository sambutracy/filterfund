import { PolkadotService } from './polkadot-service';

export interface Filter {
  platform: string;
  filterType: string;
  instructions: string;
  filterUrl: string;
}

export interface Donation {
  id?: string;
  campaignId?: string;
  donor: string;
  amount: bigint;
  timestamp: bigint;
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
  deadline: bigint; // Changed from number to bigint
  isActive: boolean;
  creatorName: string;
  creator: string;
  filter: Filter;
  donations: Donation[];
}

export class CampaignService {
  static async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const campaigns = await PolkadotService.getAllCampaigns();
      return campaigns.map(campaign => ({
        ...campaign,
        target: BigInt(campaign.target),
        amountCollected: BigInt(campaign.amountCollected),
        deadline: BigInt(campaign.deadline),
        donations: (campaign.donations || []).map(donation => ({
          id: (donation as any).id || '',
          campaignId: (donation as any).campaignId || campaign.id,
          donor: donation.donor,
          amount: BigInt(donation.amount),
          timestamp: BigInt(donation.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Return mock data in case of error (development only)
      return this.getMockCampaigns();
    }
  }
  
  static async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const campaign = await PolkadotService.getCampaign(id);
      if (campaign) {
        return {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          mainImage: campaign.mainImage,
          filterImage: campaign.filterImage || '',
          category: campaign.category,
          target: BigInt(campaign.target),
          amountCollected: BigInt(campaign.amountCollected),
          deadline: BigInt(campaign.deadline), // Convert to BigInt
          isActive: campaign.isActive,
          creatorName: campaign.creatorName,
          creator: campaign.creator,
          filter: {
            platform: campaign.filter.platform,
            filterType: campaign.filter.filterType,
            instructions: campaign.filter.instructions,
            filterUrl: campaign.filter.filterUrl
          },
          donations: (campaign.donations || []).map(donation => ({
            ...donation,
            amount: BigInt(donation.amount),
            timestamp: BigInt(donation.timestamp)
          }))
        };
      }
      return null;
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
        campaign.deadline.getTime(), // Convert Date to timestamp (number)
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
  
  static async donateToCampaign(
    campaignId: string, 
    amount: number, 
    message?: string, 
    isAnonymous: boolean = false
  ): Promise<boolean | string> {
    try {
      return await PolkadotService.donateToCampaign(campaignId, amount, message, isAnonymous);
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