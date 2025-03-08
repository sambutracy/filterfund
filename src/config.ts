// src/config.ts
export const config = {
  canisterIds: {
    development: {
      asset: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      campaign: "be2us-64aaa-aaaaa-qaabq-cai",
      user: "br5f7-7uaaa-aaaaa-qaaca-cai"
    },
    production: {
      asset: process.env.REACT_APP_ASSET_CANISTER_ID || "",
      campaign: process.env.REACT_APP_CAMPAIGN_CANISTER_ID || "",
      user: process.env.REACT_APP_USER_CANISTER_ID || ""
    }
  },
  isProduction: process.env.NODE_ENV === 'production',
  icHost: process.env.REACT_APP_IC_HOST || "https://ic0.app"
};