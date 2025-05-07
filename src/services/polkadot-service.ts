import { initPolkadotApi, connectWallet } from './polkadot-api';
import { PinataService } from './pinata-service';
import { config } from '../config/env';

// Check for demo mode
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// Configure logging only for development
const ENABLE_DEBUG_LOGGING = process.env.NODE_ENV !== 'production';
const logDebug = (...args: any[]) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.log('[PolkadotService]', ...args);
  }
};

// Type definitions
export interface Filter {
  platform: string;
  filterType: string;
  instructions: string;
  filterUrl: string;
}

export interface Donation {
  donor: string;
  amount: string | number;
  timestamp: number;
  message?: string;
  isAnonymous?: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  filterImage: string;
  category: string;
  target: string | number;
  amountCollected: string | number;
  deadline: number;
  isActive: boolean;
  creatorName: string;
  creator: string;
  filter: Filter;
  donations: Donation[];
}

// Mock demo data for video presentation
const demoCampaigns: Campaign[] = [
  {
    id: "0",
    title: "Women's Empowerment AR Filter Campaign",
    description: "Support our campaign to create and distribute AR filters that raise awareness about women's empowerment and gender equality. Our filters will feature inspirational women throughout history and educational messages.",
    mainImage: "https://images.unsplash.com/photo-1621352404112-58e2468e53ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    filterImage: "https://chart.googleapis.com/chart?cht=qr&chl=https%3A%2F%2Fwww.instagram.com%2Far%2F445367642&chs=180x180&choe=UTF-8&chld=L|2",
    category: "Equality",
    target: 10000,
    amountCollected: 6750,
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    isActive: true,
    creatorName: "Victoria Sampson",
    creator: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    filter: {
      platform: "Instagram",
      filterType: "Face Filter",
      instructions: "Open Instagram camera, search for 'WomenEmpowerAR' or scan the QR code.",
      filterUrl: "https://www.instagram.com/ar/445367642"
    },
    donations: [
      {
        donor: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        amount: 1500,
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        message: "Proud to support such an important cause!",
        isAnonymous: false
      },
      {
        donor: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
        amount: 2500,
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        message: "Keep up the great work!",
        isAnonymous: false
      },
      {
        donor: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
        amount: 1000,
        timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
        isAnonymous: true
      },
      {
        donor: "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
        amount: 1750,
        timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000,
        message: "This is exactly what we need more of. Supporting from Kenya!",
        isAnonymous: false
      }
    ]
  },
  {
    id: "1",
    title: "Climate Change Awareness AR Experience",
    description: "Our AR filter shows the impact of climate change on local ecosystems. Support us to develop and distribute this educational tool to schools and social media users worldwide.",
    mainImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    filterImage: "https://chart.googleapis.com/chart?cht=qr&chl=https%3A%2F%2Fwww.snapchat.com%2Funlock%2F%3Ftype%3DSNAP_CODE%26uuid%3D53f7e0de&chs=180x180&choe=UTF-8&chld=L|2",
    category: "Environment",
    target: 15000,
    amountCollected: 8200,
    deadline: Date.now() + 45 * 24 * 60 * 60 * 1000, // 45 days from now
    isActive: true,
    creatorName: "Eco Futures Alliance",
    creator: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    filter: {
      platform: "Snapchat",
      filterType: "World Filter",
      instructions: "Open Snapchat, scan the code, and point your camera at any open space to see climate effects.",
      filterUrl: "https://www.snapchat.com/unlock/?type=SNAP_CODE&uuid=53f7e0de"
    },
    donations: [
      {
        donor: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        amount: 3000,
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        message: "Amazing work - every school should have this!",
        isAnonymous: false
      },
      {
        donor: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
        amount: 2200,
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
        isAnonymous: true
      },
      {
        donor: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
        amount: 3000,
        timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
        message: "From our environmental science department - please connect with us!",
        isAnonymous: false
      }
    ]
  },
  {
    id: "2",
    title: "Educational AR for Rural Schools",
    description: "We're creating AR filters that teach math, science and history in engaging ways for students in rural areas with limited educational resources.",
    mainImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    filterImage: "https://chart.googleapis.com/chart?cht=qr&chl=https%3A%2F%2Fwww.tiktok.com%2Feffect%2F73e32fa&chs=180x180&choe=UTF-8&chld=L|2",
    category: "Education",
    target: 8000,
    amountCollected: 4800,
    deadline: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
    isActive: true,
    creatorName: "Future Learn Initiative",
    creator: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
    filter: {
      platform: "TikTok",
      filterType: "Interactive",
      instructions: "Open TikTok, tap Effects, scan this code and interact with educational elements.",
      filterUrl: "https://www.tiktok.com/effect/73e32fa"
    },
    donations: [
      {
        donor: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        amount: 1000,
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        message: "As a teacher, I see huge potential in this!",
        isAnonymous: false
      },
      {
        donor: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
        amount: 1800,
        timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000,
        message: "Education is the key to progress. Keep innovating!",
        isAnonymous: false
      },
      {
        donor: "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
        amount: 2000,
        timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000,
        isAnonymous: true
      }
    ]
  }
];

// Error parser for blockchain errors
export const parsePolkadotError = (error: any): { code: string; message: string } => {
  // Default error info
  let errorInfo = {
    code: 'unknown',
    message: 'An unknown error occurred'
  };

  if (!error) {
    return errorInfo;
  }

  try {
    if (typeof error === 'string') {
      // Handle string errors
      if (error.includes('deadline')) {
        return { code: 'deadline', message: 'Campaign deadline must be in the future' };
      }
      if (error.includes('balance')) {
        return { code: 'balance', message: 'Insufficient balance for this operation' };
      }
      return { code: 'string', message: error };
    }

    // Handle object errors
    if (error.message) {
      // Look for specific error patterns
      if (error.message.includes('wasm')) {
        return { code: 'wasm-trap', message: 'Smart contract execution failed' };
      }
      if (error.message.includes('balance')) {
        return { code: 'balance', message: 'Insufficient balance for this operation' };
      }
      if (error.message.includes('deadline')) {
        return { code: 'deadline', message: 'The deadline provided is invalid' };
      }
      if (error.message.includes('not found')) {
        return { code: 'not-found', message: 'The requested item was not found' };
      }
      return { code: 'object', message: error.message };
    }

    // Extract info from complex error objects (like Polkadot.js errors)
    if (error.data) {
      if (typeof error.data === 'string') {
        return { code: 'data', message: error.data };
      }
      
      if (error.data.message) {
        return { code: 'data-message', message: error.data.message };
      }
    }

    // Nothing specific found, return generic error
    return { code: 'generic', message: 'Operation failed. Please try again.' };
  } catch (parseError) {
    console.error('Error while parsing error:', parseError);
    return { code: 'parse-failed', message: 'An unexpected error occurred' };
  }
};

// Class containing all Polkadot blockchain interactions
export class PolkadotService {
  // Initialize web3.storage for IPFS uploads
  static async ensureW3Storage(email?: string): Promise<void> {
    // In demo mode, skip actual initialization
    if (DEMO_MODE) {
      logDebug("DEMO MODE: Skipping W3Storage initialization");
      return;
    }
    
    try {
      if (!email) {
        throw new Error("Email is required for storage initialization");
      }
      
      // Check for required configs
      // Check for Pinata API keys
      if (!config.PINATA_API_KEY || !config.PINATA_API_SECRET) {
        throw new Error("Pinata API configuration is missing. Please check your environment variables.");
      }
      
      logDebug("W3Storage initialized successfully for", email);
    } catch (error) {
      console.error("Failed to initialize W3Storage:", error);
      throw error;
    }
  }

  // Upload asset to IPFS and return CID
  static async uploadAsset(file: File, namePrefix: string): Promise<string> {
    // In demo mode, return a dummy URL
    if (DEMO_MODE) {
      logDebug("DEMO MODE: Skipping file upload, returning demo URL");
      const dummyUrls: Record<string, string> = {
        MainImage: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
        FilterImage: "https://chart.googleapis.com/chart?cht=qr&chl=https%3A%2F%2Fdemo-ar-filter.com&chs=180x180&choe=UTF-8&chld=L|2"
      };
      
      return dummyUrls[namePrefix] || "https://via.placeholder.com/800x600?text=Demo+Image";
    }
    
    try {
      if (!file) {
        throw new Error("No file provided for upload");
      }
      
      // For demo purposes, no actual API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // First try Pinata
      const pinataResult = await PinataService.pinFileToIPFS(file);
      if (pinataResult?.IpfsHash) {
        return `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;
      }
      
      // Fallback to IPFS directly
      const metadata = {
        name: `${namePrefix}_${Date.now()}`,
        type: file.type
      };
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dummy response for demo
      return "https://ipfs.io/ipfs/QmV9tSDx9UiPeWExXEeH6aoDvmihvx6jD5eLb4jbTaKGps";
    } catch (error) {
      console.error("Failed to upload asset:", error);
      throw error;
    }
  }

  // Create a new campaign
  static async createCampaign(
    title: string,
    description: string,
    target: number,
    deadline: number,
    mainImage: string,
    filterImage: string,
    creatorName: string,
    category: string,
    filter: Filter
  ): Promise<string> {
    // In demo mode, return a dummy campaign ID
    if (DEMO_MODE) {
      logDebug("DEMO MODE: Creating campaign in demo mode");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      return "0"; // ID of the first demo campaign
    }
    
    try {
      // Check for required API connection
      const api = await initPolkadotApi();
      const accounts = await connectWallet();
      
      if (accounts.length === 0) {
        throw new Error("No accounts available. Please connect your wallet.");
      }
      
      logDebug("Creating campaign with parameters:", {
        title,
        description,
        target,
        deadline,
        category,
        mainImage: mainImage ? "Provided" : "Not provided",
        filterImage: filterImage ? "Provided" : "Not provided"
      });
      
      // For production, you would execute the actual contract call here
      
      // Return a campaign ID (hash or specific ID from blockchain)
      return "campaign_id_123";
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
  }

  // Get a specific campaign by ID
  static async getCampaign(id: string): Promise<Campaign | null> {
    // In demo mode, return the corresponding demo campaign
    if (DEMO_MODE) {
      logDebug(`DEMO MODE: Getting campaign with ID ${id}`);
      const campaign = demoCampaigns.find(c => c.id === id) || demoCampaigns[0];
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return campaign;
    }
    
    try {
      // Check for required API connection
      const api = await initPolkadotApi();
      
      logDebug(`Fetching campaign with ID: ${id}`);
      
      // In a real implementation, fetch from blockchain
      
      // Placeholder response
      return null;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      return null;
    }
  }

  // Get all campaigns
  static async getAllCampaigns(): Promise<Campaign[]> {
    // In demo mode, return all demo campaigns
    if (DEMO_MODE) {
      logDebug("DEMO MODE: Getting all campaigns");
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      return demoCampaigns;
    }
    
    try {
      // Check for required API connection
      const api = await initPolkadotApi();
      
      logDebug("Fetching all campaigns");
      
      // In a real implementation, fetch from blockchain
      
      // Placeholder response
      return [];
    } catch (error) {
      console.error("Error fetching all campaigns:", error);
      return [];
    }
  }

  // Get top campaigns based on amount collected
  static async getTopCampaigns(limit: number = 5): Promise<Campaign[]> {
    // In demo mode, return sorted demo campaigns
    if (DEMO_MODE) {
      logDebug(`DEMO MODE: Getting top ${limit} campaigns`);
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
      
      // Sort by amount collected and take the requested number
      const sortedCampaigns = [...demoCampaigns].sort((a, b) => {
        return Number(b.amountCollected) - Number(a.amountCollected);
      }).slice(0, limit);
      
      return sortedCampaigns;
    }
    
    try {
      // Check for required API connection
      const api = await initPolkadotApi();
      
      logDebug(`Fetching top ${limit} campaigns`);
      
      // Get all campaigns first
      const allCampaigns = await this.getAllCampaigns();
      
      // Sort by amount collected and take the requested number
      const topCampaigns = [...allCampaigns]
        .sort((a, b) => Number(b.amountCollected) - Number(a.amountCollected))
        .slice(0, limit);
      
      return topCampaigns;
    } catch (error) {
      console.error(`Error fetching top ${limit} campaigns:`, error);
      return [];
    }
  }

  // Donate to a campaign
  static async donateToCampaign(
    campaignId: string,
    amount: number,
    message?: string,
    isAnonymous: boolean = false
  ): Promise<boolean | string> {
    // In demo mode, simulate successful donation
    if (DEMO_MODE) {
      logDebug(`DEMO MODE: Donating ${amount} to campaign ${campaignId}`);
      
      // Simulate transaction processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the campaign to update
      const campaign = demoCampaigns.find(c => c.id === campaignId);
      if (campaign) {
        // Update the campaign with the new donation
        campaign.amountCollected = Number(campaign.amountCollected) + amount;
        campaign.donations.unshift({
          donor: "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw", // Demo donor address
          amount,
          timestamp: Date.now(),
          message,
          isAnonymous
        });
      }
      
      return "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // Dummy transaction hash
    }
    
    try {
      // Check for required API connection
      const api = await initPolkadotApi();
      const accounts = await connectWallet();
      
      if (accounts.length === 0) {
        throw new Error("No accounts available. Please connect your wallet.");
      }
      
      logDebug(`Donating ${amount} to campaign ${campaignId}`);
      
      // In a real implementation, execute blockchain transaction
      
      return true;
    } catch (error) {
      console.error(`Error donating to campaign ${campaignId}:`, error);
      throw error;
    }
  }

  // Get blockchain timestamp
  static async getCurrentBlockchainTime(): Promise<number> {
    // In demo mode, return current time
    if (DEMO_MODE) {
      return Date.now();
    }
    
    try {
      const api = await initPolkadotApi();
      // Get current block
      const currentBlock = await api.rpc.chain.getBlock();
      // Get timestamp from current block (if your chain has timestamp pallet)
      const timestamp = await api.query.timestamp.now();
      
      // Cast Codec to the proper type before calling toNumber
      // Using the Compact<Moment> type from Polkadot API
      return (timestamp as unknown as { toNumber: () => number }).toNumber();
    } catch (error) {
      console.error("Error getting blockchain time:", error);
      // Fallback to local time
      return Date.now();
    }
  }
}