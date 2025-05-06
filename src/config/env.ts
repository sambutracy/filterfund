// src/config/env.ts
// Central source of truth for all environment variables and Polkadot config

// First, ensure window.process.env exists
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
}

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

// Network-specific configuration
const NETWORK_CONFIGS = {
  development: {
    endpoint: "ws://127.0.0.1:9944",
    contractAddress: "5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM"
  },
  shibuya: {
    endpoint: getEnvValue(['REACT_APP_SHIBUYA_ENDPOINT'], "wss://shibuya-rpc.dwellir.com"),
    contractAddress: getEnvValue(['REACT_APP_SHIBUYA_CONTRACT_ADDRESS'], "YjRXP44Yc5AhuRgKo4KKWb3grvxfDsufiEpXgACrrNZDyrL")
  },
  polkadot: {
    endpoint: "wss://rpc.polkadot.io",
    contractAddress: "5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM"
  }
};

// Get current network from environment or default to shibuya
const currentNetwork = getEnvValue(['REACT_APP_NETWORK'], 'shibuya') as keyof typeof NETWORK_CONFIGS;

// Export configuration
export const config = {
  // Use network-specific config
  polkadotEndpoint: NETWORK_CONFIGS[currentNetwork]?.endpoint,
  contractAddress: NETWORK_CONFIGS[currentNetwork]?.contractAddress,
  
  // Add Pinata JWT
  pinataJwt: getEnvValue(['REACT_APP_PINATA_JWT'], ""),
  
  // Keep Privy auth
  privyAppId: getEnvValue(['REACT_APP_PRIVY_APP_ID'], ""),
  
  // Other config values
  isDevelopment: process.env.NODE_ENV !== 'production',
  network: currentNetwork
};

// Make environment config available globally
if (typeof window !== 'undefined') {
  (window as any).APP_CONFIG = config;
}

export default config;
