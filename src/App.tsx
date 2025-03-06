import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { PrivyProvider } from '@privy-io/react-auth';
import { StateContextProvider } from './context';
import AppRoutes from './AppRoutes';

// Make sure the app ID exists
const PRIVY_APP_ID = process.env.REACT_APP_PRIVY_APP_ID;
if (!PRIVY_APP_ID) {
  throw new Error('Missing REACT_APP_PRIVY_APP_ID environment variable');
}

const App: React.FC = () => {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
    >
      <PrivyProvider
        appId={PRIVY_APP_ID}
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
