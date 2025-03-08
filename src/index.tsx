import React from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import and initialize centralized environment configuration
import { config } from './config/env';

// Import debug utilities and print debug info
import { printDebugInfo } from './config/debug';

// Print debug info to console
console.log("FilterFund App Starting...");
printDebugInfo();

// Make sure the environment variables are properly set
if (!config.canisterIds.CAMPAIGN || !config.canisterIds.ASSET || !config.canisterIds.USER) {
  console.error("CRITICAL ERROR: Missing canister IDs in environment configuration");
  
  // Add canister IDs directly to window.process.env as a fallback
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  
  if (!window.process.env.CAMPAIGN_CANISTER_ID) {
    window.process.env.CAMPAIGN_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai";
    console.log("Added fallback CAMPAIGN_CANISTER_ID to window.process.env");
  }
  
  if (!window.process.env.ASSET_CANISTER_ID) {
    window.process.env.ASSET_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
    console.log("Added fallback ASSET_CANISTER_ID to window.process.env");
  }
  
  if (!window.process.env.USER_CANISTER_ID) {
    window.process.env.USER_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai";
    console.log("Added fallback USER_CANISTER_ID to window.process.env");
  }
}

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();