import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import './global.css';

// Import centralized config
import { config } from './config/env';

// Import your components
import LandingPage from './pages/LandingPage';
import HomePage from './pages/Homepage';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Profile from './pages/Profile';
import ConnectionStatus from './components/ConnectionStatus';

// Configure logging only for development
const ENABLE_DEBUG_LOGGING = process.env.NODE_ENV === 'development';
const logDebug = (...args: any[]) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.log('[App]', ...args);
  }
};

// Check for demo mode
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

const App: React.FC = () => {
  const [showDemoNotice, setShowDemoNotice] = useState(DEMO_MODE);
  
  useEffect(() => {
    if (DEMO_MODE) {
      logDebug('Running in DEMO MODE');
      // Auto-hide the demo notice after 5 seconds
      const timer = setTimeout(() => setShowDemoNotice(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Standard component rendering without debug panels
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
    >
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        {showDemoNotice && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-center">
            Demo Mode Active - No blockchain connection required
            <button 
              className="ml-2 text-white underline"
              onClick={() => setShowDemoNotice(false)}
            >
              Dismiss
            </button>
          </div>
        )}
        <ConnectionStatus />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/campaign/:id" element={<CampaignDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default App;