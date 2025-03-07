import { Actor, HttpAgent } from '@dfinity/agent';
import { canisterIds } from '../canister-config';
import { idlFactory as campaignIdlFactory } from "../declarations/campaign";
import { idlFactory as assetIdlFactory } from "../declarations/asset";
import { idlFactory as userIdlFactory } from "../declarations/user";

// Create a local agent
const createAgent = async () => {
  const agent = new HttpAgent({ host: "http://localhost:8000" });
  
  // Only fetch the root key in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      await agent.fetchRootKey();
    } catch (e) {
      console.warn("Unable to fetch root key. Check if your local replica is running");
      console.error(e);
    }
  }
  
  return agent;
};

// Create actors using our hardcoded IDs
export const createCampaignActor = async () => {
  const agent = await createAgent();
  return Actor.createActor(campaignIdlFactory, {
    agent,
    canisterId: canisterIds.campaign,
  });
};

export const createAssetActor = async () => {
  const agent = await createAgent();
  return Actor.createActor(assetIdlFactory, {
    agent,
    canisterId: canisterIds.asset,
  });
};

export const createUserActor = async () => {
  const agent = await createAgent();
  return Actor.createActor(userIdlFactory, {
    agent,
    canisterId: canisterIds.user,
  });
};