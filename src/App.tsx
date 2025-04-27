import React from 'react';
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

const App: React.FC = () => {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
    >
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
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