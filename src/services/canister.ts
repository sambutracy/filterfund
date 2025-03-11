// src/services/canister.ts - Fixed imports and type handling
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Import centralized environment config
import { config } from '../config/env';

// Import declarations without direct type imports that cause issues
import { idlFactory as campaignIdlFactory } from "../declarations/campaign";
import { idlFactory as assetIdlFactory } from "../declarations/asset";
import { idlFactory as userIdlFactory } from "../declarations/user";

// Define the interfaces directly to avoid declaration import issues
// These match the structure from the .did.d.ts files but avoid import issues
export interface Campaign {
  id: bigint;
  title: string;
  created: bigint;
  creator: Principal;
  amountCollected: bigint;
  description: string;
  deadline: bigint;
  filterImage: string;
  creatorName: string;
  isActive: boolean;
  filter: FilterDetails;
  target: bigint;
  category: CauseCategory;
  mainImage: string;
  donations: Donation[];
}

export interface Donation {
  isAnonymous: boolean;
  message: string[] | [];
  timestamp: bigint;
  amount: bigint;
  donor: Principal;
}

export interface FilterDetails {
  previewImage: string;
  filterType: string;
  platform: string;
  instructions: string;
  filterUrl: string;
}

export type CauseCategory = 
  { Health: null } |
  { Environment: null } |
  { Poverty: null } |
  { Equality: null } |
  { AnimalWelfare: null } |
  { Other: null } |
  { Education: null } |
  { HumanRights: null };

export type AssetType = 
  { FilterImage: null } |
  { MainImage: null } |
  { Other: null };

export interface UserProfile {
  principal: Principal;
  username: string;
  email: string;
  bio: string[] | [];
  avatarUrl: string[] | [];
  socialLinks: string[];
  created: bigint;
  totalDonations: bigint;
  campaignsCreated: bigint;
}

// Define service interfaces
interface CampaignServiceInterface {
  createCampaign: (request: any) => Promise<{ ok: bigint } | { err: string }>;
  donateToCampaign: (campaignId: bigint, amount: bigint, message: string[] | [], isAnonymous: boolean) => Promise<{ ok: null } | { err: string }>;
  getActiveCampaigns: () => Promise<Campaign[]>;
  getAllCampaigns: () => Promise<Campaign[]>;
  getCampaign: (id: bigint) => Promise<Campaign[]>;
  getCampaignCount: () => Promise<bigint>;
  getCampaignDonors: (campaignId: bigint) => Promise<Principal[]>;
  getCampaignsByCategory: (category: CauseCategory) => Promise<Campaign[]>;
  getMyCampaigns: () => Promise<Campaign[]>;
  getRecentCampaigns: (limit: bigint) => Promise<Campaign[]>;
  getTopCampaigns: (limit: bigint) => Promise<Campaign[]>;
  updateCampaignStatus: (campaignId: bigint, isActive: boolean) => Promise<{ ok: null } | { err: string }>;
}

interface AssetServiceInterface {
  acceptCycles: () => Promise<void>;
  deleteAsset: (assetId: string) => Promise<{ ok: null } | { err: string }>;
  finishAssetUpload: (assetId: string) => Promise<{ ok: string } | { err: string }>;
  getAssetInfo: (assetId: string) => Promise<any>;
  getMyAssets: () => Promise<any[]>;
  startAssetUpload: (filename: string, contentType: string, assetType: AssetType) => Promise<{ ok: string } | { err: string }>;
  uploadChunk: (assetId: string, data: number[]) => Promise<{ ok: bigint } | { err: string }>;
}

interface UserServiceInterface {
  deleteUser: () => Promise<{ ok: null } | { err: string }>;
  getAllUsers: () => Promise<UserProfile[]>;
  getUserCount: () => Promise<bigint>;
  getUserProfile: (principal: Principal) => Promise<UserProfile[]>;
  getUserProfileByUsername: (username: string) => Promise<UserProfile[]>;
  registerUser: (username: string, email: string, bio: string[] | [], avatarUrl: string[] | [], socialLinks: string[]) => Promise<{ ok: Principal } | { err: string }>;
  searchUsers: (term: string) => Promise<UserProfile[]>;
  updateUserProfile: (username: string[] | [], email: string[] | [], bio: string[] | [], avatarUrl: string[] | [], socialLinks: string[][] | []) => Promise<{ ok: null } | { err: string }>;
  updateUserStats: (incrementDonations: bigint[] | [], incrementCampaigns: bigint[] | []) => Promise<{ ok: null } | { err: string }>;
}

// Set up the host from centralized config
const host = config.icHost;

// Use canister IDs from centralized config
const CANISTER_IDS = {
  ASSET: config.canisterIds.ASSET,
  CAMPAIGN: config.canisterIds.CAMPAIGN,
  USER: config.canisterIds.USER
};

// Log the canister IDs for debugging
console.log("CanisterService initialized with IDs:", CANISTER_IDS);

// Create an auth client
let authClient: AuthClient | null = null;

const initAuthClient = async (): Promise<AuthClient> => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

// Create an agent using centralized config
const createAgent = async (): Promise<HttpAgent> => {
  const agent = new HttpAgent({ host });
  
  // Fetch the root key for development
  if (config.isDevelopment) {
    try {
      await agent.fetchRootKey();
    } catch (e) {
      console.warn('Unable to fetch root key. Check if your local replica is running');
      console.error(e);
    }
  }
  
  return agent;
};

// Create actor instances with canister IDs from centralized config
const createCampaignActor = async (): Promise<CampaignServiceInterface> => {
  const agent = await createAgent();
  return Actor.createActor<CampaignServiceInterface>(campaignIdlFactory, {
    agent,
    canisterId: CANISTER_IDS.CAMPAIGN,
  });
};

const createAssetActor = async (): Promise<AssetServiceInterface> => {
  const agent = await createAgent();
  return Actor.createActor<AssetServiceInterface>(assetIdlFactory, {
    agent,
    canisterId: CANISTER_IDS.ASSET,
  });
};

const createUserActor = async (): Promise<UserServiceInterface> => {
  const agent = await createAgent();
  return Actor.createActor<UserServiceInterface>(userIdlFactory, {
    agent,
    canisterId: CANISTER_IDS.USER,
  });
};

// User-related methods
export const registerUser = async (
  username: string,
  email: string,
  bio: string | null = null,
  avatarUrl: string | null = null,
  socialLinks: string[] = []
): Promise<Principal | Error> => {
  try {
    const userActor = await createUserActor();
    const result = await userActor.registerUser(
      username,
      email,
      bio ? [bio] : [],
      avatarUrl ? [avatarUrl] : [],
      socialLinks
    );
    
    if ('ok' in result) {
      return result.ok;
    } else {
      throw new Error(result.err);
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const getUserProfile = async (principal: Principal): Promise<UserProfile | null> => {
  try {
    const userActor = await createUserActor();
    const result = await userActor.getUserProfile(principal);
    
    if (result.length > 0) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  username: string | null = null,
  email: string | null = null,
  bio: string | null = null,
  avatarUrl: string | null = null,
  socialLinks: string[] | null = null
): Promise<boolean> => {
  try {
    const userActor = await createUserActor();
    const result = await userActor.updateUserProfile(
      username ? [username] : [],
      email ? [email] : [],
      bio ? [bio] : [],
      avatarUrl ? [avatarUrl] : [],
      socialLinks ? [socialLinks] : []
    );
    
    return 'ok' in result;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Asset-related methods
// Updated upload function with proper error handling
export const uploadAsset = async (
  file: File,
  assetType: 'MainImage' | 'FilterImage' | 'Other'
): Promise<string | Error> => {
  try {
    const assetActor = await createAssetActor();
    
    // Create an asset type variant
    const assetTypeObj: Record<string, null> = {};
    assetTypeObj[assetType] = null;
    
    // Read the file as a blob
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log(`Uploading asset: ${file.name}, size: ${file.size}, type: ${file.type}, assetType: ${assetType}`);
    
    // First try the simplified method if it exists
    if ('uploadAssetSimple' in assetActor) {
      try {
        const result = await (assetActor as any).uploadAssetSimple(
          file.name,
          file.type,
          Array.from(uint8Array),
          assetTypeObj as unknown as AssetType
        );
        
        if ('err' in result) {
          throw new Error(result.err);
        }
        
        console.log(`Upload successful: ${result.ok}`);
        return result.ok;
      } catch (uploadError) {
        console.warn("Simplified upload failed, falling back to chunked upload:", uploadError);
        // Fall through to chunked upload
      }
    }
    
    // Fall back to chunked upload
    const startResult = await assetActor.startAssetUpload(
      file.name,
      file.type,
      assetTypeObj as unknown as AssetType
    );
    
    if ('err' in startResult) {
      throw new Error(startResult.err);
    }
    
    const assetId = startResult.ok;
    
    // Upload in a single chunk
    const chunkResult = await assetActor.uploadChunk(
      assetId,
      Array.from(uint8Array)
    );
    
    if ('err' in chunkResult) {
      throw new Error(chunkResult.err);
    }
    
    // Finish the upload
    const finishResult = await assetActor.finishAssetUpload(assetId);
    
    if ('err' in finishResult) {
      throw new Error(finishResult.err);
    }
    
    console.log(`Upload successful: ${finishResult.ok}`);
    return finishResult.ok;
  } catch (error) {
    console.error('Error uploading asset:', error);
    throw error;
  }
};

// Campaign-related methods
export const createCampaign = async (
  title: string,
  description: string,
  target: number,
  deadline: Date,
  mainImageUrl: string,
  filterImageUrl: string,
  creatorName: string,
  category: string,
  filterDetails: FilterDetails
): Promise<bigint | Error> => {
  try {
    console.log("Creating campaign with params:", {
      title,
      description,
      target,
      deadline,
      mainImageUrl,
      filterImageUrl,
      creatorName,
      category,
      filterDetails
    });
    
    const campaignActor = await createCampaignActor();
    
    // Create a category object dynamically
    const categoryObj: Record<string, null> = {};
    categoryObj[category] = null;
    
    // Create the request
    const request = {
      title,
      description,
      target: BigInt(target),
      deadline: BigInt(deadline.getTime() * 1000000), // Convert to nanoseconds
      mainImage: mainImageUrl,
      filterImage: filterImageUrl,
      creatorName,
      category: categoryObj as unknown as CauseCategory,
      filter: filterDetails,
    };
    
    const result = await campaignActor.createCampaign(request);
    
    if ('ok' in result) {
      console.log("Campaign created successfully with ID:", result.ok.toString());
      return result.ok;
    } else {
      console.error("Campaign creation failed:", result.err);
      throw new Error(result.err);
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

// Helper function to convert a category to a displayable string
export const categoryToString = (category: CauseCategory): string => {
  if ('Health' in category) return 'Health';
  if ('Education' in category) return 'Education';
  if ('Environment' in category) return 'Environment';
  if ('Equality' in category) return 'Equality';
  if ('Poverty' in category) return 'Poverty';
  if ('HumanRights' in category) return 'Human Rights';
  if ('AnimalWelfare' in category) return 'Animal Welfare';
  return 'Other';
};

export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    console.log("Fetching all campaigns from canister:", CANISTER_IDS.CAMPAIGN);
    const campaignActor = await createCampaignActor();
    const campaigns = await campaignActor.getAllCampaigns();
    console.log(`Retrieved ${campaigns.length} campaigns`);
    return campaigns;
  } catch (error) {
    console.error(`Error fetching campaigns from canister ${CANISTER_IDS.CAMPAIGN}:`, error);
    console.log('Using IC host:', host);
    return [];
  }
};

export const getCampaign = async (id: bigint): Promise<Campaign | null> => {
  try {
    const campaignActor = await createCampaignActor();
    const result = await campaignActor.getCampaign(id);
    
    if (result.length > 0) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
};

export const getActiveCampaigns = async (): Promise<Campaign[]> => {
  try {
    const campaignActor = await createCampaignActor();
    return await campaignActor.getActiveCampaigns();
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    return [];
  }
};

export const getTopCampaigns = async (limit: number): Promise<Campaign[]> => {
  try {
    const campaignActor = await createCampaignActor();
    return await campaignActor.getTopCampaigns(BigInt(limit));
  } catch (error) {
    console.error('Error fetching top campaigns:', error);
    return [];
  }
};

export const getUserCampaigns = async (): Promise<Campaign[]> => {
  try {
    const campaignActor = await createCampaignActor();
    return await campaignActor.getMyCampaigns();
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }
};

// Get campaigns by a specific user principal
export const getCampaignsByCreator = async (creator: Principal): Promise<Campaign[]> => {
  try {
    const campaignActor = await createCampaignActor();
    
    // Check if getCampaignsByCreator method exists
    if ('getCampaignsByCreator' in campaignActor) {
      return await (campaignActor as any).getCampaignsByCreator(creator);
    } else {
      // Fallback: Get all campaigns and filter by creator
      console.log("getCampaignsByCreator not available, using fallback method");
      const allCampaigns = await campaignActor.getAllCampaigns();
      return allCampaigns.filter((campaign: Campaign) => 
        Principal.fromText(campaign.creator.toString()).toText() === creator.toText()
      );
    }
  } catch (error) {
    console.error('Error fetching campaigns by creator:', error);
    return [];
  }
};

export const donateToCampaign = async (
  campaignId: bigint,
  amount: number,
  message: string | null = null,
  isAnonymous: boolean = false
): Promise<boolean> => {
  try {
    const campaignActor = await createCampaignActor();
    const result = await campaignActor.donateToCampaign(
      campaignId,
      BigInt(amount),
      message ? [message] : [],
      isAnonymous
    );
    
    return 'ok' in result;
  } catch (error) {
    console.error('Error donating to campaign:', error);
    return false;
  }
};

// Export all functions as a service
export const CanisterService = {
  // Public config access
  getConfig: () => config,
  getCanisterId: (name: 'ASSET' | 'CAMPAIGN' | 'USER') => CANISTER_IDS[name],
  
  // Helper functions
  categoryToString,
  
  // User methods
  registerUser,
  getUserProfile,
  updateUserProfile,
  
  // Asset methods
  uploadAsset,
  
  // Campaign methods
  createCampaign,
  getAllCampaigns,
  getCampaign,
  getActiveCampaigns,
  getTopCampaigns,
  getUserCampaigns,
  getCampaignsByCreator,
  donateToCampaign,
};

export default CanisterService;