import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

// Import your contract ABI (generated after building the contract)
import contractAbi from '../contracts/filterfundnew.json';

// Define types for use across the application
export interface Filter {
  platform: string;
  filterType: string;
  instructions: string;
  filterUrl: string;
}

export interface Donation {
  donor: string;
  amount: number;
  timestamp: number;
  message?: string;
  isAnonymous: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  filterImage: string;
  category: string;
  target: number; // Changed from bigint for compatibility
  amountCollected: number; // Changed from bigint for compatibility
  isActive: boolean;
  creatorName: string;
  creator: string;
  deadline: number; // Store as timestamp for easier manipulation
  filter: Filter;
  donations: Donation[];
}

export class PolkadotService {
  private static api: ApiPromise | null = null;
  private static contract: ContractPromise | null = null;
  
  // Update these with your deployed contract address after deployment
  private static CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM';
  private static ENDPOINT = process.env.REACT_APP_POLKADOT_ENDPOINT || 'ws://127.0.0.1:9944';

  static async connectToPolkadot(): Promise<ApiPromise> {
    if (!this.api) {
      const provider = new WsProvider(this.ENDPOINT);
      this.api = await ApiPromise.create({ provider });
    }
    return this.api;
  }

  static async getContract(): Promise<ContractPromise> {
    if (!this.contract) {
      const api = await this.connectToPolkadot();
      this.contract = new ContractPromise(api, contractAbi, this.CONTRACT_ADDRESS);
    }
    return this.contract;
  }

  static async connectWallet(): Promise<any[]> {
    await web3Enable('FilterFund AR Platform');
    const accounts = await web3Accounts();
    return accounts;
  }

  // Method for uploading assets (mocked for now, would need IPFS integration)
  static async uploadAsset(file: File, assetType: string): Promise<string> {
    console.log(`Uploading ${assetType}: ${file.name}`);
    
    // In a real implementation, you would upload to IPFS or similar
    // For now, we'll just mock and return a placeholder URL
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock URL that would come from IPFS or similar storage
        const mockUrl = `https://example.com/ipfs/${assetType}-${Date.now()}-${file.name.replace(/\s/g, '')}`;
        console.log(`Uploaded to: ${mockUrl}`);
        resolve(mockUrl);
      }, 1000);
    });
  }

  static async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const contract = await this.getContract();
      
      // Call the get_all_campaigns method from your contract
      const { result, output } = await contract.query.getAllCampaigns(
        '', // Caller address, empty string for read operations
        { gasLimit: -1 } // Max gas limit for read
      );
      
      if (result.isOk && output) {
        // Convert the contract output to a JavaScript array
        const campaigns = output.toHuman();
        // Ensure campaigns is an array before formatting
        const campaignsArray = Array.isArray(campaigns) ? campaigns : [];
        return this.formatCampaigns(campaignsArray);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return this.getMockCampaigns(); // Return mock data for development
    }
  }
  
  // Added for the filters tab
  static async getTopCampaigns(limit: number = 5): Promise<Campaign[]> {
    const allCampaigns = await this.getAllCampaigns();
    // Sort by amount collected (descending) and take the top N
    return allCampaigns
      .sort((a, b) => b.amountCollected - a.amountCollected)
      .slice(0, limit);
  }

  static async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const contract = await this.getContract();
      
      // Call the get_campaign method from your contract
      const { result, output } = await contract.query.getCampaign(
        '',
        { gasLimit: -1 },
        parseInt(id)
      );
      
      if (result.isOk && output && !output.isEmpty) {
        // Convert the contract output to a JavaScript object
        const campaign = output.toHuman();
        return this.formatCampaign(campaign);
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting campaign ${id}:`, error);
      // Return mock campaign for development
      return this.getMockCampaign(id);
    }
  }

  static async createCampaign(
    title: string,
    description: string,
    target: number,
    deadline: number, // Changed from Date to number (timestamp)
    mainImage: string,
    filterImage: string,
    creatorName: string,
    category: string,
    filter: Filter
  ): Promise<string> {
    try {
      const accounts = await this.connectWallet();
      if (!accounts.length) {
        throw new Error('No wallet accounts found');
      }
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);
      
      // Call create_campaign function
      const tx = await contract.tx.createCampaign(
        { gasLimit: 1000000000 },
        title,
        description,
        mainImage,
        filterImage,
        category,
        target.toString(),
        deadline.toString(),
        {
          platform: filter.platform,
          filter_type: filter.filterType,
          instructions: filter.instructions,
          filter_url: filter.filterUrl
        },
        creatorName
      );
      
      const result = await tx.signAndSend(
        accountAddress, 
        { signer: injector.signer }
      );
      
      // For development, return a mock ID
      return Math.floor(Math.random() * 1000).toString();
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  static async donateToCampaign(
    campaignId: string, 
    amount: number, 
    message: string = '', 
    isAnonymous: boolean = false
  ): Promise<boolean> {
    try {
      const accounts = await this.connectWallet();
      if (!accounts.length) {
        throw new Error('No wallet accounts found');
      }
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);
      
      // Call donate_to_campaign function (payable function)
      const tx = await contract.tx.donateToCampaign(
        { 
          gasLimit: 1000000000,
          value: amount.toString() 
        },
        parseInt(campaignId)
      );
      
      await tx.signAndSend(
        accountAddress, 
        { signer: injector.signer }
      );
      
      // In a real implementation, we'd register the message and anonymity status separately
      console.log(`Donation message: ${message}, isAnonymous: ${isAnonymous}`);
      
      return true;
    } catch (error) {
      console.error(`Error donating to campaign ${campaignId}:`, error);
      return false;
    }
  }

  // Helper method to format contract campaign data to your frontend format
  private static formatCampaign(campaignData: any): Campaign | null {
    if (!campaignData) return null;
    
    return {
      id: campaignData.id,
      title: campaignData.title,
      description: campaignData.description,
      creator: campaignData.creator,
      creatorName: campaignData.creatorName,
      mainImage: campaignData.mainImage,
      filterImage: campaignData.filterImage || '', // Handle null case
      category: campaignData.category,
      target: parseInt(campaignData.target.replace(/,/g, '')),
      amountCollected: parseInt(campaignData.amountCollected.replace(/,/g, '')),
      deadline: parseInt(campaignData.deadline.replace(/,/g, '')),
      isActive: campaignData.isActive,
      filter: {
        platform: campaignData.filter.platform,
        filterType: campaignData.filter.filterType,
        instructions: campaignData.filter.instructions,
        filterUrl: campaignData.filter.filterUrl
      },
      donations: [] // Empty by default, would be populated separately
    };
  }

  private static formatCampaigns(campaignsData: any[]): Campaign[] {
    return campaignsData
      .map(campaign => this.formatCampaign(campaign))
      .filter((campaign): campaign is Campaign => campaign !== null);
  }
  
  // Mock data for development and testing
  private static getMockCampaigns(): Campaign[] {
    return [
      {
        id: "1",
        title: "Women Empowerment Campaign",
        description: "Supporting women's rights initiatives around the world.",
        mainImage: "https://placekitten.com/800/400",
        filterImage: "", // Empty string instead of null
        category: "Equality",
        target: 10000,
        amountCollected: 5000,
        isActive: true,
        creatorName: "Jane Doe",
        creator: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        deadline: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        filter: {
          platform: "Instagram",
          filterType: "Face Filter",
          instructions: "Open Instagram camera and search for filter",
          filterUrl: "https://example.com/filter/womens-rights"
        },
        donations: [
          {
            donor: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
            amount: 1000,
            timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
            message: "Keep up the great work!",
            isAnonymous: false
          }
        ]
      },
      {
        id: "2",
        title: "Campaign for Climate Action",
        description: "Promoting sustainable practices for our planet.",
        mainImage: "https://placekitten.com/800/401",
        filterImage: "", // Empty string instead of null
        category: "Environment",
        target: 15000,
        amountCollected: 7500,
        isActive: true,
        creatorName: "John Smith",
        creator: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        deadline: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
        filter: {
          platform: "Snapchat",
          filterType: "World Filter",
          instructions: "Open Snapchat and scan this QR code",
          filterUrl: "https://example.com/filter/climate-action"
        },
        donations: []
      }
    ];
  }
  
  // Get a single mock campaign by ID
  private static getMockCampaign(id: string): Campaign | null {
    const mockCampaigns = this.getMockCampaigns();
    return mockCampaigns.find(campaign => campaign.id === id) || null;
  }
}