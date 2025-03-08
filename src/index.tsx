import React from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Ensure window.process exists
window.process = window.process || {};
window.process.env = window.process.env || {};

// Set canister IDs if not already set
// These will be overridden by webpack environment variables if available
if (!window.process.env.REACT_APP_CAMPAIGN_CANISTER_ID) {
  window.process.env.REACT_APP_CAMPAIGN_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai";
}
if (!window.process.env.REACT_APP_ASSET_CANISTER_ID) {
  window.process.env.REACT_APP_ASSET_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
}
if (!window.process.env.REACT_APP_USER_CANISTER_ID) {
  window.process.env.REACT_APP_USER_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai";
}
if (!window.process.env.REACT_APP_PRIVY_APP_ID) {
  window.process.env.REACT_APP_PRIVY_APP_ID = "cm7x0zd4401hgnd3c43e9kfpr";
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