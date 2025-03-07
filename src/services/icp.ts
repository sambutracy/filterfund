// src/services/icp.ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Import interface factory methods
import { idlFactory as campaignIdlFactory } from '../declarations/campaign/campaign.did.js';
import { idlFactory as filterIdlFactory } from '../declarations/filter/filter.did.js';
import { idlFactory as userIdlFactory } from '../declarations/user/user.did.js';

// Types to be imported from generated declarations
import { _SERVICE as CampaignService } from '../declarations/campaign/campaign.did';
import { _SERVICE as FilterService } from '../declarations/filter/filter.did';
import { _SERVICE as UserService } from '../declarations/user/user.did';

// Canister IDs - replace with actual IDs from dfx.json or environment variables
const CAMPAIGN_CANISTER_ID = process.env.REACT_APP_CAMPAIGN_CANISTER_ID || 'campaign';
const FILTER_CANISTER_ID = process.env.REACT_APP_FILTER_CANISTER_ID || 'filter';
const USER_CANISTER_ID = process.env.REACT_APP_USER_CANISTER_ID || 'user';

// Host URL - use ICP mainnet in production
const DFX_NETWORK = process.env.REACT_APP_DFX_NETWORK || 'local';
const HOST = DFX_NETWORK === 'local' ? 'http://localhost:8000' : 'https://ic0.app';

// Create an agent
const createAgent = async (forceRefresh = false) => {
  const authClient = await AuthClient.create();
  
  if (forceRefresh) {
    await authClient.logout();
  }
  
  if (!authClient.isAuthenticated()) {
    return new HttpAgent({ host: HOST });
  }
  
  const identity = await authClient.getIdentity();
  const agent = new HttpAgent({ host: HOST, identity });
  
  // Only fetch the root key in local development
  if (DFX_NETWORK === 'local') {
    await agent.fetchRootKey();
  }
  
  return agent;
};

// Create actor instances for each canister
export const createCampaignActor = async () => {
  const agent = await createAgent();
  return Actor.createActor<CampaignService>(campaignIdlFactory, {
    agent,
    canisterId: CAMPAIGN_CANISTER_ID,
  });
};

export const createFilterActor = async () => {
  const agent = await createAgent();
  return Actor.createActor<FilterService>(filterIdlFactory, {
    agent,
    canisterId: FILTER_CANISTER_ID,
  });
};

export const createUserActor = async () => {
  const agent = await createAgent();
  return Actor.createActor<UserService>(userIdlFactory, {
    agent,
    canisterId: USER_CANISTER_ID,
  });
};

// Authentication functions
export const login = async (): Promise<boolean> => {
  const authClient = await AuthClient.create();
  
  return new Promise((resolve) => {
    authClient.login({
      identityProvider: DFX_NETWORK === 'local' 
        ? `http://localhost:8000?canisterId=${process.env.REACT_APP_IDENTITY_CANISTER_ID}`
        : 'https://identity.ic0.app',
      onSuccess: () => resolve(true),
      onError: () => resolve(false),
    });
  });
};

export const logout = async (): Promise<void> => {
  const authClient = await AuthClient.create();
  await authClient.logout();
};

export const getIdentity = async () => {
  const authClient = await AuthClient.create();
  if (await authClient.isAuthenticated()) {
    return authClient.getIdentity();
  }
  return null;
};

export const getPrincipal = async () => {
  const identity = await getIdentity();
  if (identity) {
    return identity.getPrincipal();
  }
  return null;
};

// Campaign-related functions
export const getCampaigns = async () => {
  try {
    const campaignActor = await createCampaignActor();
    const result = await campaignActor.getAllCampaigns();
    return result;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

export const createCampaign = async (campaignData: {
  title: string;
  description: string;
  target: number;
  deadline: number;
  mainImage: string;
  category: any;
  filter: any;
  impactMetrics: any;
  socialLinks: any;
}) => {
  try {
    const campaignActor = await createCampaignActor();
    const result = await campaignActor.createCampaign(
      campaignData.title,
      campaignData.description,
      BigInt(campaignData.target),
      BigInt(campaignData.deadline),
      campaignData.mainImage,
      campaignData.category,
      campaignData.filter,
      campaignData.impactMetrics,
      campaignData.socialLinks
    );
    return result;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const donateToCampaign = async (campaignId: number, amount: number) => {
  try {
    const campaignActor = await createCampaignActor();
    const result = await campaignActor.donateToCampaign(BigInt(campaignId), BigInt(amount));
    return result;
  } catch (error) {
    console.error('Error donating to campaign:', error);
    throw error;
  }
};

// User-related functions
export const registerUser = async (username: string, email: string, bio?: string, socialLinks: string[] = []) => {
  try {
    const userActor = await createUserActor();
    const result = await userActor.registerUser(username, email, bio ? [bio] : [], socialLinks);
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const getUserProfile = async (principal: string) => {
  try {
    const userActor = await createUserActor();
    const result = await userActor.getUserProfile(Principal.fromText(principal));
    return result;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Filter-related functions
export const getFilterStats = async (filterId: string) => {
  try {
    const filterActor = await createFilterActor();
    const result = await filterActor.getFilterStats(filterId);
    return result;
  } catch (error) {
    console.error('Error getting filter stats:', error);
    return null;
  }
};

export const recordFilterUse = async (filterId: string, duration: number, platform: string, location: string) => {
  try {
    const filterActor = await createFilterActor();
    const result = await filterActor.recordFilterUse(filterId, BigInt(duration), platform, location);
    return result;
  } catch (error) {
    console.error('Error recording filter use:', error);
    return false;
  }
};
