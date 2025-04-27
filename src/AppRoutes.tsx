import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from './components/LoadingSpinner';

// Add a proper loading UI component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner className="mx-auto h-12 w-12" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading experience...</p>
    </div>
  </div>
);

// Keep your existing lazy imports for page components
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const HomePage = React.lazy(() => import('./pages/Homepage'));
const CreateCampaign = React.lazy(() => import('./pages/CreateCampaign'));
const CampaignDetails = React.lazy(() => import('./pages/CampaignDetails'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/create-campaign" element={
          <ProtectedRoute>
            <CreateCampaign />
          </ProtectedRoute>
        } />
        
        <Route path="/campaign/:id" element={
          <ProtectedRoute>
            <CampaignDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;