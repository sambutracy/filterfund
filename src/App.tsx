import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { PrivyProvider } from '@privy-io/react-auth';
import { StateContextProvider } from './context';
import AppRoutes from './AppRoutes';
import { privyAppId } from './canister-config';

// Make sure the app ID exists
if (!privyAppId) {
  throw new Error('Missing Privy App ID. Make sure REACT_APP_PRIVY_APP_ID is set in your environment.');
}

const App: React.FC = () => {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
    >
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'wallet'],
          appearance: {
            theme: 'light',
            accentColor: '#f97316',
            logo: 'https://your-logo-url.com',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <StateContextProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </StateContextProvider>
      </PrivyProvider>
    </ThemeProvider>
  );
};

export default App;