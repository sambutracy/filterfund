// src/config/debug.js
// This file can be imported to debug environment configuration issues

import { config } from './env';

console.log("========== ICP Environment Configuration Debug ==========");
console.log("Canister IDs:");
console.log("- ASSET: ", config.canisterIds.ASSET || "UNDEFINED!");
console.log("- CAMPAIGN: ", config.canisterIds.CAMPAIGN || "UNDEFINED!");
console.log("- USER: ", config.canisterIds.USER || "UNDEFINED!");
console.log("- FRONTEND: ", config.canisterIds.FRONTEND || "UNDEFINED!");
console.log("IC Host:", config.icHost);
console.log("isDevelopment:", config.isDevelopment);
console.log("Process Environment:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- ASSET_CANISTER_ID:", process.env.ASSET_CANISTER_ID);
console.log("- CAMPAIGN_CANISTER_ID:", process.env.CAMPAIGN_CANISTER_ID);
console.log("- USER_CANISTER_ID:", process.env.USER_CANISTER_ID);
console.log("- REACT_APP_ASSET_CANISTER_ID:", process.env.REACT_APP_ASSET_CANISTER_ID);
console.log("- REACT_APP_CAMPAIGN_CANISTER_ID:", process.env.REACT_APP_CAMPAIGN_CANISTER_ID);
console.log("- REACT_APP_USER_CANISTER_ID:", process.env.REACT_APP_USER_CANISTER_ID);
console.log("=======================================================");

// Export a function to run this debug info on demand
export const printDebugInfo = () => {
  console.log("========== ICP Environment Configuration Debug ==========");
  console.log("Canister IDs:");
  console.log("- ASSET: ", config.canisterIds.ASSET || "UNDEFINED!");
  console.log("- CAMPAIGN: ", config.canisterIds.CAMPAIGN || "UNDEFINED!");
  console.log("- USER: ", config.canisterIds.USER || "UNDEFINED!");
  console.log("- FRONTEND: ", config.canisterIds.FRONTEND || "UNDEFINED!");
  console.log("IC Host:", config.icHost);
  console.log("isDevelopment:", config.isDevelopment);
  console.log("=======================================================");
  
  return config;
};

export default { printDebugInfo, config };