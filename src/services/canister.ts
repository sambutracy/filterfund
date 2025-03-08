import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { canisterIds, networks, icHost } from '../canister-config';

// Import declarations - only import the IDL factories
import { idlFactory as campaignIdlFactory } from "../declarations/campaign";
import { idlFactory as assetIdlFactory } from "../declarations/asset";
import { idlFactory as userIdlFactory } from "../declarations/user";

// Import types with renamed interfaces to avoid conflicts
import type { _SERVICE as CampaignServiceInterface, Campaign, CauseCategory, Donation, FilterDetails } from "../declarations/campaign/campaign.did.d";
import type { _SERVICE as AssetServiceInterface, AssetType } from "../declarations/asset/asset.did.d";
import type { _SERVICE as UserServiceInterface, UserProfile } from "../declarations/user/user.did.d";

// Re-export types
export type { Campaign, CauseCategory, Donation, FilterDetails, AssetType, UserProfile };

// Hardcoded canister IDs for absolute fallback
const FALLBACK_CANISTER_IDS = {
  ASSET: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
  CAMPAIGN: "be2us-64aaa-aaaaa-qaabq-cai",
  USER: "br5f7-7uaaa-aaaaa-qaaca-cai"
};

// Logging function for debugging
const logCanisterConfig = () => {
  console.log('Canister Configuration:', {
    campaignCanisterId: canisterIds.campaign,
    assetCanisterId: canisterIds.asset,
    userCanisterId: canisterIds.user,
    icHost: icHost,
    nodeEnv: process.env.NODE_ENV
  });
};

// Create an agent directly with better error handling
const createAgent = async (): Promise<HttpAgent> => {
  // Log configuration before creating agent
  logCanisterConfig();

  const host = process.env.NODE_ENV === 'production' 
    ? networks.mainnet 
    : icHost;

  console.log(`Creating agent with host: ${host}`);

  const agent = new HttpAgent({ host });
  
  // Fetch the root key for development
  if (process.env.NODE_ENV !== 'production') {
    try {
      await agent.fetchRootKey();
    } catch (e) {
      console.warn('Unable to fetch root key. Check if your local replica is running');
      console.error(e);
    }
  }
  
  return agent;
};

// Create actor instances with better error handling
const createCampaignActor = async (): Promise<CampaignServiceInterface> => {
  try {
    const agent = await createAgent();
    
    // Additional logging for campaign actor creation
    console.log('Campaign Canister ID:', canisterIds.campaign || FALLBACK_CANISTER_IDS.CAMPAIGN);

    const canisterId = canisterIds.campaign || FALLBACK_CANISTER_IDS.CAMPAIGN;
    
    if (!canisterId) {
      throw new Error('No campaign canister ID found');
    }

    return Actor.createActor<CampaignServiceInterface>(campaignIdlFactory, {
      agent,
      canisterId: canisterId,
    });
  } catch (error) {
    console.error('Error creating campaign actor:', error);
    throw new Error('Failed to initialize campaign service');
  }
};

const createAssetActor = async (): Promise<AssetServiceInterface> => {
  try {
    const agent = await createAgent();
    
    const canisterId = canisterIds.asset || FALLBACK_CANISTER_IDS.ASSET;
    
    if (!canisterId) {
      throw new Error('No asset canister ID found');
    }

    return Actor.createActor<AssetServiceInterface>(assetIdlFactory, {
      agent,
      canisterId: canisterId,
    });
  } catch (error) {
    console.error('Error creating asset actor:', error);
    throw error;
  }
};

const createUserActor = async (): Promise<UserServiceInterface> => {
  try {
    const agent = await createAgent();
    
    const canisterId = canisterIds.user || FALLBACK_CANISTER_IDS.USER;
    
    if (!canisterId) {
      throw new Error('No user canister ID found');
    }

    return Actor.createActor<UserServiceInterface>(userIdlFactory, {
      agent,
      canisterId: canisterId,
    });
  } catch (error) {
    console.error('Error creating user actor:', error);
    throw error;
  }
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
      return result[0] as UserProfile;
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
export const uploadAsset = async (
  file: File,
  assetType: 'MainImage' | 'FilterImage' | 'Other'
): Promise<string | Error> => {
  try {
    const assetActor = await createAssetActor();
    
    // Create an asset type variant
    const assetTypeObj: Record<string, null> = {};
    assetTypeObj[assetType] = null;
    
    const startResult = await assetActor.startAssetUpload(
      file.name,
      file.type,
      assetTypeObj as unknown as AssetType
    );
    
    if ('err' in startResult) {
      throw new Error(startResult.err);
    }
    
    const assetId = startResult.ok;
    
    // Read the file in chunks
    const chunkSize = 500 * 1024; // 500KB chunks
    const fileSize = file.size;
    let offset = 0;
    
    while (offset < fileSize) {
      const end = Math.min(offset + chunkSize, fileSize);
      const chunk = file.slice(offset, end);
      const uint8Array = new Uint8Array(await chunk.arrayBuffer());
      
      // Upload the chunk
      const chunkResult = await assetActor.uploadChunk(
        assetId,
        Array.from(uint8Array)
      );
      
      if ('err' in chunkResult) {
        throw new Error(chunkResult.err);
      }
      
      offset = end;
    }
    
    // Finish the upload
    const finishResult = await assetActor.finishAssetUpload(assetId);
    
    if ('err' in finishResult) {
      throw new Error(finishResult.err);
    }
    
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
      return result.ok;
    } else {
      throw new Error(result.err);
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const campaignActor = await createCampaignActor();
    return await campaignActor.getAllCampaigns();
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

export const getCampaign = async (id: bigint): Promise<Campaign | null> => {
  try {
    const campaignActor = await createCampaignActor();
    const result = await campaignActor.getCampaign(id);
    
    if (result.length > 0) {
      return result[0] as Campaign;
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
  donateToCampaign,
};

export default CanisterService;