// src/config/env.ts
// Central source of truth for all environment variables and Polkadot config

// First, ensure window.process.env exists
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
}

// Default Polkadot endpoints
const DEFAULT_POLKADOT_ENDPOINT = "wss://rpc.polkadot.io";
const DEFAULT_DEVELOPMENT_ENDPOINT = "ws://127.0.0.1:9944";
const REACT_APP_POLKADOT_ENDPOINT = "wss://shibuya-rpc.dwellir.com";
const REACT_APP_CONTRACT_ADDRESS = "Your_Deployed_Contract_Address";
const REACT_APP_CONTRACT_ABI = "Your_Contract_ABI_JSON";

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
}

// Export configuration
export const config = {
  // Add Polkadot config
  polkadotEndpoint: getEnvValue(
    ['REACT_APP_POLKADOT_ENDPOINT'], 
    process.env.NODE_ENV === 'development' ? DEFAULT_DEVELOPMENT_ENDPOINT : DEFAULT_POLKADOT_ENDPOINT
  ),
  
  // Keep Privy auth
  privyAppId: getEnvValue(['REACT_APP_PRIVY_APP_ID'], DEFAULT_PRIVY_APP_ID),
  
  isDevelopment: process.env.NODE_ENV !== 'production',
};

// Make environment config available globally
if (typeof window !== 'undefined') {
  // Add a global config object for easier debugging
  (window as any).IC_CONFIG = config;
}

export default config;
