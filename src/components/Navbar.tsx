// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import DarkModeToggle from './DarkModeToggle';

const Navbar: React.FC = () => {
  const { login, authenticated, logout, user } = usePrivy();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore', path: '/home' },
    { name: 'Create Campaign', path: '/create-campaign' },
  ];

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user) return 'U';
    
    // Try to get initial from wallet address
    if (user.wallet?.address) {
      return user.wallet.address.slice(2, 3).toUpperCase();
    }
    
    // Fallback to default
    return 'U';
  };

  return (
    <header className="bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 text-white px-4 md:px-8 py-4 fixed w-full top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to={authenticated ? "/home" : "/"} className="text-2xl md:text-3xl font-bold hover:text-red-100 transition-colors">
          FilterFund
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {authenticated && navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`hover:text-red-100 transition-colors ${
                location.pathname === link.path ? 'text-white font-semibold' : 'text-white/80'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <DarkModeToggle />

          {authenticated ? (
            <div className="flex items-center gap-4">
              {/* Profile Button */}
              <Link 
                to="/profile" 
                className="flex items-center gap-2 hover:text-red-100 transition-colors"
                title={user?.wallet?.address || 'Profile'}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {getUserInitial()}
                </div>
                <span className="hidden lg:inline">Profile</span>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => login()}
              className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 mt-0 py-4 px-4 md:hidden"
          >
            {authenticated && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 hover:text-red-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {authenticated && (
              <>
                <Link
                  to="/profile"
                  className="block py-2 hover:text-red-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:text-red-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
            
            {!authenticated && (
              <button 
                onClick={() => {
                  login();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 hover:text-red-100 transition-colors"
              >
                Sign In
              </button>
            )}

            <div className="pt-2 mt-2 border-t border-white/20">
              <DarkModeToggle />
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Navbar;