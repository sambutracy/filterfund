// src/config/env.ts
// Central source of truth for all environment variables and canister IDs

// First, ensure window.process.env exists
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
}

// Default canister IDs for local development
const DEFAULT_CANISTER_IDS = {
  ASSET: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
  CAMPAIGN: "be2us-64aaa-aaaaa-qaabq-cai",
  USER: "br5f7-7uaaa-aaaaa-qaaca-cai",
  FRONTEND: "bd3sg-teaaa-aaaaa-qaaba-cai"
};

// Default ICP host
const DEFAULT_IC_HOST = "http://localhost:8000";

// Privy authentication
const DEFAULT_PRIVY_APP_ID = "cm7x0zd4401hgnd3c43e9kfpr";

// Helper function to get value from multiple potential sources
const getEnvValue = (keys: string[], defaultValue: string): string => {
  // Check process.env
  for (const key of keys) {
    if (process.env[key]) {
      return process.env[key] as string;
    }
  }
  
  // Check window.process.env as fallback
  if (typeof window !== 'undefined') {
    for (const key of keys) {
      if ((window.process?.env as any)?.[key]) {
        return (window.process.env as any)[key];
      }
    }
  }
  
  return defaultValue;
};

// Get canister IDs with fallback mechanism
const ASSET_CANISTER_ID = getEnvValue(
  ['REACT_APP_ASSET_CANISTER_ID', 'ASSET_CANISTER_ID', 'CANISTER_ID_ASSET'], 
  DEFAULT_CANISTER_IDS.ASSET
);

const CAMPAIGN_CANISTER_ID = getEnvValue(
  ['REACT_APP_CAMPAIGN_CANISTER_ID', 'CAMPAIGN_CANISTER_ID', 'CANISTER_ID_CAMPAIGN'], 
  DEFAULT_CANISTER_IDS.CAMPAIGN
);

const USER_CANISTER_ID = getEnvValue(
  ['REACT_APP_USER_CANISTER_ID', 'USER_CANISTER_ID', 'CANISTER_ID_USER'], 
  DEFAULT_CANISTER_IDS.USER
);

const FRONTEND_CANISTER_ID = getEnvValue(
  ['REACT_APP_FRONTEND_CANISTER_ID', 'FRONTEND_CANISTER_ID', 'CANISTER_ID_FRONTEND'], 
  DEFAULT_CANISTER_IDS.FRONTEND
);

// Immediately set these values on window.process.env to ensure availability
if (typeof window !== 'undefined') {
  window.process.env.ASSET_CANISTER_ID = ASSET_CANISTER_ID;
  window.process.env.CAMPAIGN_CANISTER_ID = CAMPAIGN_CANISTER_ID;
  window.process.env.USER_CANISTER_ID = USER_CANISTER_ID;
  window.process.env.FRONTEND_CANISTER_ID = FRONTEND_CANISTER_ID;
  
  // Also set REACT_APP versions for compatibility
  window.process.env.REACT_APP_ASSET_CANISTER_ID = ASSET_CANISTER_ID;
  window.process.env.REACT_APP_CAMPAIGN_CANISTER_ID = CAMPAIGN_CANISTER_ID;
  window.process.env.REACT_APP_USER_CANISTER_ID = USER_CANISTER_ID;
  window.process.env.REACT_APP_FRONTEND_CANISTER_ID = FRONTEND_CANISTER_ID;
  
  console.log("Environment variables set on window.process.env:", {
    ASSET_CANISTER_ID,
    CAMPAIGN_CANISTER_ID,
    USER_CANISTER_ID,
    FRONTEND_CANISTER_ID
  });
}

// Create and export the config object
export const config = {
  // Canister IDs
  canisterIds: {
    ASSET: ASSET_CANISTER_ID,
    CAMPAIGN: CAMPAIGN_CANISTER_ID,
    USER: USER_CANISTER_ID,
    FRONTEND: FRONTEND_CANISTER_ID
  },
  
  // IC Host
  icHost: getEnvValue(['REACT_APP_IC_HOST'], DEFAULT_IC_HOST),
  
  // Auth
  privyAppId: getEnvValue(['REACT_APP_PRIVY_APP_ID'], DEFAULT_PRIVY_APP_ID),
  
  // Network
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  // Helper methods
  getCanisterId: function(name: 'ASSET' | 'CAMPAIGN' | 'USER' | 'FRONTEND') {
    return this.canisterIds[name];
  }
};

// Make environment config available globally
if (typeof window !== 'undefined') {
  // Add a global config object for easier debugging
  (window as any).IC_CONFIG = config;
}

export default config;
