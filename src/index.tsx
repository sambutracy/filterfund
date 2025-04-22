import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import { StateContextProvider } from './context';
import { config } from './config/env';

// Import the global CSS file
import './global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Make sure the environment variables are properly set
if (!config.polkadotEndpoint) {
  console.error("CRITICAL ERROR: Missing Polkadot endpoint in environment configuration");
}

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={config.privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#7C3AED',
          logo: 'https://your-logo-url.svg',
        },
      }}
    >
      <StateContextProvider>
        <Router>
          <App />
        </Router>
      </StateContextProvider>
    </PrivyProvider>
  </React.StrictMode>
);