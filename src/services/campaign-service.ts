import { initPolkadotApi } from './polkadot-api';
import { ApiPromise } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';

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
      console.log('Getting all campaigns...');
      const api = await initPolkadotApi();
      
      // Check if campaign pallet exists on the connected chain
      if (!api.query.campaignPallet) {
        console.warn('Campaign pallet not found on this chain. Returning mock data.');
        return this.getMockCampaigns();
      }
      
      // Query your Polkadot pallet
      const campaignCount = await api.query.campaignPallet.campaignCount();
      const campaigns: Campaign[] = [];
      
      // Iterate through all campaigns
      for (let i = 0; i < Number(campaignCount); i++) {
        const campaignOpt = await api.query.campaignPallet.campaigns(i);
        
        if (campaignOpt.isSome) {
          const campaign = campaignOpt.unwrap();
          campaigns.push({
            id: i.toString(),
            title: this.hexToString(campaign.title),
            description: this.hexToString(campaign.description),
            mainImage: this.hexToString(campaign.main_image),
            filterImage: this.hexToString(campaign.filter_image),
            category: this.hexToString(campaign.category),
            target: BigInt(campaign.target.toString()),
            amountCollected: BigInt(campaign.amount_collected.toString()),
            isActive: campaign.is_active,
            creatorName: this.hexToString(campaign.creator_name),
            creator: campaign.creator.toString(),
            deadline: BigInt(campaign.deadline.toString()),
            filter: {
              platform: this.hexToString(campaign.filter.platform),
              filterType: this.hexToString(campaign.filter.filter_type),
              instructions: this.hexToString(campaign.filter.instructions),
              filterUrl: this.hexToString(campaign.filter.filter_url)
            }
          });
        }
      }
      
      return campaigns;
    } catch (error) {
      console.error('Error fetching campaigns from Polkadot:', error);
      // Return mock data in case of error (development only)
      return this.getMockCampaigns();
    }
  }
  
  // Helper method to convert hex to string
  private static hexToString(hexValue: any): string {
    if (!hexValue || !hexValue.toHex) return '';
    
    const hex = hexValue.toHex();
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.substr(i, 2), 16);
      if (code !== 0) {
        str += String.fromCharCode(code);
      }
    }
    return str;
  }
  
  static async createCampaign(campaign: Omit<Campaign, 'id' | 'amountCollected' | 'isActive'>): Promise<string> {
    try {
      console.log('Creating campaign...');
      const api = await initPolkadotApi();
      
      // Check if the user has injected account (through extension)
      const accounts = await window.injectedWeb3?.['polkadot-js']?.enable('FilterFund AR Platform');
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect a wallet first.');
      }
      
      // Select the first account
      const account = accounts[0];
      const injector = await web3FromAddress(account);
      
      // Create a transaction to create a campaign
      const tx = api.tx.campaignPallet.createCampaign(
        this.stringToHex(campaign.title),
        this.stringToHex(campaign.description),
        this.stringToHex(campaign.mainImage),
        this.stringToHex(campaign.filterImage || ''),
        this.stringToHex(campaign.category),
        campaign.target.toString(),
        campaign.deadline.toString(),
        [
          this.stringToHex(campaign.filter.platform),
          this.stringToHex(campaign.filter.filterType),
          this.stringToHex(campaign.filter.instructions),
          this.stringToHex(campaign.filter.filterUrl)
        ],
        this.stringToHex(campaign.creatorName)
      );
      
      // Sign and send the transaction
      const result = await tx.signAndSend(account, { signer: injector.signer });
      
      // Return the campaign ID (this would ideally come from the chain event)
      return result.toString();
    } catch (error) {
      console.error('Error creating campaign on Polkadot:', error);
      throw error;
    }
  }
  
  // Helper method to convert string to hex
  private static stringToHex(value: string): string {
    let hex = '';
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      hex += code.toString(16).padStart(2, '0');
    }
    return '0x' + hex;
  }
  
  static async donateToCampaign(campaignId: string, amount: number): Promise<void> {
    try {
      console.log(`Donating ${amount} to campaign ${campaignId}...`);
      const api = await initPolkadotApi();
      
      // Check if the user has injected account
      const accounts = await window.injectedWeb3?.['polkadot-js']?.enable('FilterFund AR Platform');
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect a wallet first.');
      }
      
      // Select the first account
      const account = accounts[0];
      const injector = await web3FromAddress(account);
      
      // Create a transaction to donate to a campaign
      const tx = api.tx.campaignPallet.donateToCampaign(
        campaignId,
        amount.toString()
      );
      
      // Sign and send the transaction
      await tx.signAndSend(account, { signer: injector.signer });
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