// src/services/canister.ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Import the canister interfaces
import { idlFactory as campaignIdlFactory } from '../../declarations/campaign/campaign.did.js';
import { idlFactory as assetIdlFactory } from '../../declarations/asset/asset.did.js';
import { idlFactory as userIdlFactory } from '../../declarations/user/user.did.js';

// Type definitions based on our canisters
export interface AssetType {
  MainImage: null;
  FilterImage: null;
  Other: null;
}

export interface CauseCategory {
  Health: null;
  Education: null;
  Environment: null;
  Equality: null;
  Poverty: null;
  HumanRights: null;
  AnimalWelfare: null;
  Other: null;
}

export interface FilterDetails {
  platform: string;
  filterUrl: string;
  previewImage: string;
  filterType: string;
  instructions: string;
}

export interface Donation {
  donor: Principal;
  amount: bigint;
  message: [] | [string];
  timestamp: bigint;
  isAnonymous: boolean;
}

export interface Campaign {
  id: bigint;
  creator: Principal;
  creatorName: string;
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  amountCollected: bigint;
  mainImage: string;
  filterImage: string;
  category: CauseCategory;
  filter: FilterDetails;
  donations: Donation[];
  isActive: boolean;
  created: bigint;
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  mainImage: string;
  filterImage: string;
  creatorName: string;
  category: CauseCategory;
  filter: FilterDetails;
}

export interface Asset {
  id: string;
  owner: Principal;
  createdAt: bigint;
  contentType: string;
  filename: string;
  chunkIds: bigint[];
  assetType: AssetType;
}

export interface UserProfile {
  principal: Principal;
  username: string;
  email: string;
  bio: [] | [string];
  avatarUrl: [] | [string];
  socialLinks: string[];
  created: bigint;
  totalDonations: bigint;
  campaignsCreated: bigint;
}

// Set up the host
const host = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://ic0.app';

// Create an auth client
let authClient: AuthClient | null = null;

const initAuthClient = async (): Promise<AuthClient> => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

// Create an agent
const createAgent = async (forceRefresh = false): Promise<HttpAgent> => {
  const auth = await initAuthClient();
  
  if (forceRefresh) {
    await auth.logout();
  }
  
  if (!auth.isAuthenticated()) {
    return new HttpAgent({ host });
  }
  
  const identity = await auth.getIdentity();
  const agent = new HttpAgent({ host, identity });
  
  // Locally we need to fetch the root key
  if (process.env.NODE_ENV === 'development') {
    await agent.fetchRootKey();
  }
  
  return agent;
};

// Create actor instances for each canister
const createCampaignActor = async () => {
  const agent = await createAgent();
  const canisterId = process.env.REACT_APP_CAMPAIGN_CANISTER_ID || 'campaign';
  
  return Actor.createActor(campaignIdlFactory, {
    agent,
    canisterId,
  });
};

const createAssetActor = async () => {
  const agent = await createAgent();
  const canisterId = process.env.REACT_APP_ASSET_CANISTER_ID || 'asset';
  
  return Actor.createActor(assetIdlFactory, {
    agent,
    canisterId,
  });
};

const createUserActor = async () => {
  const agent = await createAgent();
  const canisterId = process.env.REACT_APP_USER_CANISTER_ID || 'user';
  
  return Actor.createActor(userIdlFactory, {
    agent,
    canisterId,
  });
};

// Authentication methods
export const login = async (): Promise<boolean> => {
  const auth = await initAuthClient();
  
  return new Promise((resolve) => {
    auth.login({
      identityProvider: process.env.NODE_ENV === 'development' 
        ? `http://localhost:8000?canisterId=${process.env.REACT_APP_IDENTITY_CANISTER_ID}`
        : 'https://identity.ic0.app',
      onSuccess: () => resolve(true),
      onError: () => resolve(false),
    });
  });
};

export const logout = async (): Promise<void> => {
  const auth = await initAuthClient();
  await auth.logout();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const auth = await initAuthClient();
  return await auth.isAuthenticated();
};

export const getPrincipal = async (): Promise<Principal | null> => {
  const auth = await initAuthClient();
  if (await auth.isAuthenticated()) {
    return auth.getIdentity().getPrincipal();
  }
  return null;
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
    
    return result.length > 0 ? result[0] : null;
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
    
    // Start asset upload to get an asset ID
    const startResult = await assetActor.startAssetUpload(
      file.name,
      file.type,
      { [assetType]: null }
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
      const arrayBuffer = await chunk.arrayBuffer();
      
      // Upload the chunk
      const chunkResult = await assetActor.uploadChunk(
        assetId,
        [...new Uint8Array(arrayBuffer)]
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
  category: keyof CauseCategory,
  filter: FilterDetails
): Promise<bigint | Error> => {
  try {
    const campaignActor = await createCampaignActor();
    
    const request: CreateCampaignRequest = {
      title,
      description,
      target: BigInt(target),
      deadline: BigInt(deadline.getTime() * 1000000), // Convert to nanoseconds
      mainImage: mainImageUrl,
      filterImage: filterImageUrl,
      creatorName,
      category: { [category]: null } as CauseCategory,
      filter,
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
    
    return result.length > 0 ? result[0] : null;
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

// Export all functions
export const CanisterService = {
  // Auth methods
  login,
  logout,
  isAuthenticated,
  getPrincipal,
  
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
