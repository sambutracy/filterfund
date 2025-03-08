// src/declarations/user/index.js
import { Actor, HttpAgent } from "@dfinity/agent";
// Import our centralized config
import { config } from "../../config/env";

// Imports and re-exports candid interface
import { idlFactory } from "./user.did.js";
export { idlFactory } from "./user.did.js";

// Use the canister ID from our centralized config
export const canisterId = config.canisterIds.USER;

// Log the canister ID for debugging
console.log("User canister ID:", canisterId);

export const createActor = (canisterId, options = {}) => {
  // Ensure canisterId is defined
  if (!canisterId) {
    console.error("User canister ID is undefined!");
    throw new Error("User canister ID is undefined. Check environment configuration.");
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

export const user = createActor(canisterId);
