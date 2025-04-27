// src/pages/LandingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { login, authenticated } = usePrivy();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (authenticated) {
      navigate('/home');
    }
  }, [authenticated, navigate]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block text-red-600 dark:text-red-500 xl:inline">
              FilterFund
            </span>{' '}
            <span className="block xl:inline">
              Empowering Change Through AR
            </span>
          </h1>
          
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create and fund AR filter campaigns for social impact. Join our community of creators making a difference.
          </p>
          
          <div className="mt-10 sm:flex sm:justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => login()}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:text-lg md:px-10"
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LandingPage;
