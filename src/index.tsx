import React, { createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add this at the top of src/index.tsx
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.CAMPAIGN_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai";
window.process.env.ASSET_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
window.process.env.USER_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai";

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
