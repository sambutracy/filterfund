// src/canister-config.ts
export const canisterIds = {
  campaign: process.env.REACT_APP_CAMPAIGN_CANISTER_ID || 'be2us-64aaa-aaaaa-qaabq-cai',
  asset: process.env.REACT_APP_ASSET_CANISTER_ID || 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
  user: process.env.REACT_APP_USER_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai'
};

export const icHost = process.env.REACT_APP_IC_HOST || 'http://localhost:4943';

export const networks = {
  local: icHost,
  mainnet: 'https://icp0.io'
};

export const privyAppId = process.env.REACT_APP_PRIVY_APP_ID || '';

export function validateCanisterIds() {
  const missingIds = Object.entries(canisterIds)
    .filter(([, id]) => !id)
    .map(([key]) => key);

  if (missingIds.length > 0) {
    console.warn(`Missing canister IDs for: ${missingIds.join(', ')}`);
  }
}
