// src/pages/CampaignDetails.tsx - Fix for the TypeScript errors
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { PolkadotService, Donation } from '../services/polkadot-service';

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

  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!campaign) return 0;
    
    const target = Number(campaign.target);
    const collected = Number(campaign.amountCollected);
    
    if (target === 0) return 0;
    return Math.min(Math.round((collected / target) * 100), 100);
  };

  // Format date from timestamp to readable format
  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return 'Unknown date';
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      const message = donationMessage.trim() || null;
      
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
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner />
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
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Campaigns
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        <div className="grid md:grid-cols-3 gap-8">
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
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                    {campaign.category}
                  </span>
                  <span className="px-3 py-1 bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200 rounded-full text-sm">
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
                      {Number(campaign.amountCollected).toLocaleString()} DOT raised
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {calculateProgress()}% of {Number(campaign.target).toLocaleString()} DOT
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className={`bg-lime-500 rounded-full h-4 progress-bar-fill w-[${calculateProgress()}%]`}
                    ></div>
                  </div>
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
                    className="bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-6 py-2 rounded-lg transform transition hover:scale-105"
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
                            <span className="text-lime-600 dark:text-lime-400 font-semibold">
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
              <h2 className="text-2xl font-semibold text-lime-600 dark:text-lime-400 mb-4">
                Support this Campaign
              </h2>
              
              {/* Success message */}
              {successMessage && (
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-lg mb-4">
                  {successMessage}
                </div>
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
                  className={`w-full bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white px-4 py-3 rounded-lg font-medium ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
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
      </motion.div>
    </Layout>
  );
};

export default CampaignDetails;