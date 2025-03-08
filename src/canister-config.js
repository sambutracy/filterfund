// src/canister-config.js
// Central configuration for canister IDs

// Helper to get value from environment or fallback to default
const getCanisterId = (envVar, fallback) => {
  if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env[envVar]) {
    return window.process.env[envVar];
  }
  if (typeof process !== 'undefined' && process.env && process.env[envVar]) {
    return process.env[envVar];
  }
  return fallback;
};

// Canister IDs with fallbacks for development
export const canisterIds = {
  campaign: getCanisterId('REACT_APP_CAMPAIGN_CANISTER_ID', 'be2us-64aaa-aaaaa-qaabq-cai'),
  asset: getCanisterId('REACT_APP_ASSET_CANISTER_ID', 'bkyz2-fmaaa-aaaaa-qaaaq-cai'),
  user: getCanisterId('REACT_APP_USER_CANISTER_ID', 'br5f7-7uaaa-aaaaa-qaaca-cai')
};

// Host configuration
export const icHost = getCanisterId('REACT_APP_IC_HOST', 'http://localhost:8000');

// Privy App ID
export const privyAppId = getCanisterId('REACT_APP_PRIVY_APP_ID', 'cm7x0zd4401hgnd3c43e9kfpr');