// src/declarations/campaign/index.js
import { Actor, HttpAgent } from "@dfinity/agent";
// Import our centralized config
import { config } from "../../config/env";

// Imports and re-exports candid interface
import { idlFactory } from "./campaign.did.js";
export { idlFactory } from "./campaign.did.js";

// Use the canister ID from our centralized config
export const canisterId = config.canisterIds.CAMPAIGN;

// Log the canister ID for debugging
console.log("Campaign canister ID:", canisterId);

export const createActor = (canisterId, options = {}) => {
  // Ensure canisterId is defined
  if (!canisterId) {
    console.error("Campaign canister ID is undefined!");
    throw new Error("Campaign canister ID is undefined. Check environment configuration.");
  }
  
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for certificate validation during development
  if (config.isDevelopment) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const campaign = createActor(canisterId);