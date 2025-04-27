// src/pages/CampaignDetails.tsx - Fix for the TypeScript errors
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { PolkadotService, Donation } from '../services/polkadot-service';
import ProgressBar from '../components/ProgressBar';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationMessage, setDonationMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await PolkadotService.getCampaign(id);
        
        if (!data) {
          setError("Campaign not found");
          return;
        }
        
        setCampaign(data);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError("Failed to load campaign details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  // Format date from timestamp to readable format
  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return 'Unknown date';
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate the progress percentage
  const calculateProgress = (collected: number, target: number): number => {
    if (!collected || !target || target === 0) return 0;
    const percentage = (collected / target) * 100;
    return Math.min(Math.round(percentage), 100); // Cap at 100%
  };

  // Handle donation submission
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) {
      setError("Please enter a valid donation amount");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const amount = Number(donationAmount);
      const message = donationMessage.trim() || undefined;
      
      const success = await PolkadotService.donateToCampaign(
        id,
        amount,
        message,
        isAnonymous
      );
      
      if (success) {
        setSuccessMessage("Thank you for your donation!");
        setDonationAmount('');
        setDonationMessage('');
        
        // Refresh campaign data to show updated amount
        const updatedCampaign = await PolkadotService.getCampaign(id);
        if (updatedCampaign) {
          setCampaign(updatedCampaign);
        }
      } else {
        setError("Failed to process donation. Please try again.");
      }
    } catch (error) {
      console.error("Error donating to campaign:", error);
      setError("Failed to process donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Try accessing the AR filter
  const tryFilter = () => {
    if (campaign?.filter?.filterUrl) {
      window.open(campaign.filter.filterUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Campaign skeleton - 2/3 width */}
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* Image skeleton */}
                <div className="w-full h-[300px] bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                
                <div className="p-6 space-y-4">
                  {/* Tags skeleton */}
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Title skeleton */}
                  <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  
                  {/* Creator skeleton */}
                  <div className="h-5 w-1/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  
                  {/* Progress bar skeleton */}
                  <div className="space-y-2">
                    <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Content skeletons */}
                  <div className="space-y-2">
                    <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Donation form skeleton - 1/3 width */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="h-7 w-2/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse mt-6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !campaign) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Campaign not found"}
          </h2>
          <p className="mb-6">
            The campaign you're looking for could not be loaded.
          </p>
          <button
            onClick={() => window.location.href = '/home'}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Campaigns
          </button>
        </div>
      </Layout>
    );
  }

  const percentage = campaign.target > 0 
    ? Math.floor((campaign.amountCollected * 100) / campaign.target) 
    : 0;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Campaign details - 2/3 width on medium screens and up */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Campaign image */}
              <img 
                src={campaign.mainImage} 
                alt={campaign.title}
                className="w-full h-[300px] object-cover"
              />
              
              {/* Campaign header */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
                    {campaign.category}
                  </span>
                  <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded-full text-sm">
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {campaign.title}
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  By <span className="font-semibold">{campaign.creatorName}</span>
                </p>
                
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      {percentage}% of {Number(campaign.target).toLocaleString()} DOT
                    </span>
                  </div>
                  <ProgressBar progress={percentage} showLabel={true} />
                </div>
                
                {/* Time remaining */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Campaign ends on:</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {formatDate(campaign.deadline)}
                  </p>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About this campaign</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {campaign.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                      {Number(campaign.amountCollected).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">DOT Raised</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                      {campaign.donations.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Supporters</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                      {Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Days Left</div>
                  </div>
                </div>
                
                {/* Filter information */}
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">AR Filter Information</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Platform: <span className="font-medium">{campaign.filter.platform}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Filter Type: <span className="font-medium">{campaign.filter.filterType}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Instructions: <span className="font-medium">{campaign.filter.instructions}</span>
                  </p>
                  <button
                    onClick={tryFilter}
                    className="bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white px-6 py-2 rounded-lg transform transition hover:scale-105"
                  >
                    Try Filter
                  </button>
                </div>
                
                {/* Donation list */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Donations</h3>
                  {campaign.donations.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-300">No donations yet. Be the first to donate!</p>
                  ) : (
                    <div className="space-y-4">
                      {campaign.donations.slice(0, 5).map((donation: Donation, index: number) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {donation.isAnonymous ? 'Anonymous' : `Donor ${donation.donor.substring(0, 8)}...`}
                            </span>
                            <span className="text-red-600 dark:text-red-500 font-semibold">
                              {Number(donation.amount).toLocaleString()} DOT
                            </span>
                          </div>
                          {donation.message && (
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                              "{donation.message}"
                            </p>
                          )}
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {formatDate(donation.timestamp)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Donation form - 1/3 width on medium screens and up */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg sticky top-24">
              <h2 className="text-2xl font-semibold text-red-600 dark:text-red-500 mb-4">
                Support this Campaign
              </h2>
              
              {/* Success message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="inline-block text-4xl mb-2"
                  >
                    🎉
                  </motion.div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {successMessage}
                  </p>
                </motion.div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleDonate}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Donation Amount (DOT)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    placeholder="0.00"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-lg h-24 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Leave a message with your donation"
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    Donate anonymously
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white px-4 py-3 rounded-lg font-medium ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Processing...' : 'Donate Now'}
                </button>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 text-center">
                  Your donation helps support this cause and spread awareness through AR filters.
                </p>
              </form>
              
              {/* QR Code for filter */}
              <div className="mt-8 text-center">
                <h3 className="text-lg font-semibold mb-3">Try the AR Filter</h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img 
                    src={campaign.filterImage || '/qr-placeholder.png'} 
                    alt="QR Code for AR Filter"
                    className="w-40 h-40 object-contain"
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                  Scan with {campaign.filter.platform} to try the filter
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Campaign */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Share Campaign</h3>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=Support this cause: ${campaign.title}&url=${window.location.href}`, '_blank')}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              aria-label="Share on Twitter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
              </svg>
            </button>
            <button 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
              className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition"
              aria-label="Share on Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
              </svg>
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Campaign link copied to clipboard!');
              }}
              className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition"
              aria-label="Copy link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default CampaignDetails;