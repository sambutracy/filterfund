import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import { PolkadotService, parsePolkadotError } from "../services/polkadot-service";
import LoadingSpinner from "../components/LoadingSpinner";
import { usePrivy } from '@privy-io/react-auth';
import Notification from "../components/Notification";
import { debounce } from '../utils/debounce';

// Configure logging only for development
const ENABLE_DEBUG_LOGGING = process.env.NODE_ENV !== 'production';
const logDebug = (...args: any[]) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.log('[CreateCampaign]', ...args);
  }
};

// DEMO MODE setting from environment
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// Campaign categories
const CauseCategories = [
  "Health",
  "Education",
  "Environment",
  "Equality",
  "Poverty",
  "HumanRights",
  "AnimalWelfare",
  "Other",
];

// Filter platforms
const FilterPlatforms = [
  "Snapchat",
  "Instagram",
  "TikTok",
  "Facebook",
  "Other",
];

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Education',
    deadline: '',
    target: '',
    mainImage: '',
    filterImage: '',
    creatorName: '',
    filterPlatform: 'Instagram',
    filterType: 'Face',
    filterUrl: '',
    filterInstructions: ''
  });
  
  // Files state
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [filterImageFile, setFilterImageFile] = useState<File | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [mainImageUploadProgress, setMainImageUploadProgress] = useState(0);
  const [filterImageUploadProgress, setFilterImageUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  
  // Set min date for deadline (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setForm(prevForm => ({
        ...prevForm,
        creatorName: user.email?.address?.split('@')[0] || user.google?.name || prevForm.creatorName
      }));
    }
  }, [user]);

  // Handle form field changes
  const handleFormFieldChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  // Handle image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'filter') => {
    e.preventDefault();
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`${type === 'main' ? 'Main' : 'Filter'} image file is too large. Maximum size is 5MB.`);
      setNotificationVisible(true);
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError(`${type === 'main' ? 'Main' : 'Filter'} file must be an image.`);
      setNotificationVisible(true);
      return;
    }
    
    // Update file state
    if (type === 'main') {
      setMainImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setForm({ ...form, mainImage: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFilterImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setForm({ ...form, filterImage: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    // Required fields
    if (!form.title.trim()) {
      setError("Title is required");
      setNotificationVisible(true);
      return false;
    }
    
    if (!form.description.trim()) {
      setError("Description is required");
      setNotificationVisible(true);
      return false;
    }
    
    if (!form.target || isNaN(Number(form.target)) || Number(form.target) <= 0) {
      setError("Target amount must be a positive number");
      setNotificationVisible(true);
      return false;
    }
    
    if (!form.deadline) {
      setError("Deadline is required");
      setNotificationVisible(true);
      return false;
    }
    
    if (new Date(form.deadline) <= new Date()) {
      setError("Deadline must be in the future");
      setNotificationVisible(true);
      return false;
    }
    
    if (!form.mainImage && !mainImageFile) {
      setError("Campaign image is required");
      setNotificationVisible(true);
      return false;
    }
    
    if (!form.creatorName.trim()) {
      setError("Creator name is required");
      setNotificationVisible(true);
      return false;
    }
    
    return true;
  };

  // Handle form submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Initialize storage first
      try {
        await PolkadotService.ensureW3Storage(user?.email?.address || email);
      } catch (error) {
        if (!user?.email?.address && !email) {
          setShowEmailPrompt(true);
          setIsLoading(false);
          return;
        }
        throw error;
      }

      // Validate form
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      if (DEMO_MODE) {
        // DEMO MODE: Skip actual blockchain calls
        logDebug("DEMO MODE: Simulating campaign creation");
        
        // Simulate upload progress
        setMainImageUploadProgress(20);
        await new Promise(r => setTimeout(r, 500));
        setMainImageUploadProgress(60);
        await new Promise(r => setTimeout(r, 500));
        setMainImageUploadProgress(100);
        
        if (filterImageFile) {
          setFilterImageUploadProgress(30);
          await new Promise(r => setTimeout(r, 500));
          setFilterImageUploadProgress(80);
          await new Promise(r => setTimeout(r, 300));
          setFilterImageUploadProgress(100);
        }
        
        // Show success and redirect
        await new Promise(r => setTimeout(r, 800));
        setSuccessMessage("Demo Mode: Campaign created successfully! Redirecting...");
        setNotificationVisible(true);
        
        // Navigate to campaign details page after a short delay
        setTimeout(() => {
          navigate(`/campaign/0`); // Use dummy ID in demo mode
        }, 1500);
        
        return;
      }

      // Step 1: Upload main image if provided
      let mainImageUrl = form.mainImage;
      if (mainImageFile) {
        logDebug("Uploading main image");
        try {
          setMainImageUploadProgress(10); // Start progress
          const result = await PolkadotService.uploadAsset(
            mainImageFile,
            "MainImage"
          );
          setMainImageUploadProgress(100); // Complete progress
          if (typeof result === "string") {
            mainImageUrl = result;
            logDebug("Main image uploaded successfully:", mainImageUrl);
          } else {
            throw new Error("Failed to upload main image");
          }
        } catch (err) {
          setMainImageUploadProgress(0);
          logDebug("Main image upload failed:", err);
          throw new Error("Failed to upload main image. Please try again or provide an image URL instead.");
        }
      }

      // Step 2: Upload filter image if provided
      let filterImageUrl = form.filterImage;
      if (filterImageFile) {
        logDebug("Uploading filter image");
        try {
          setFilterImageUploadProgress(10); // Start progress
          const result = await PolkadotService.uploadAsset(
            filterImageFile,
            "FilterImage"
          );
          setFilterImageUploadProgress(100); // Complete progress
          if (typeof result === "string") {
            filterImageUrl = result;
            logDebug("Filter image uploaded successfully:", filterImageUrl);
          } else {
            throw new Error("Failed to upload filter image");
          }
        } catch (err) {
          setFilterImageUploadProgress(0);
          logDebug("Filter image upload failed:", err);
          throw new Error("Failed to upload filter image. Please try again or provide an image URL instead.");
        }
      }

      // Step 3: Create filter details
      const filterDetails = {
        platform: form.filterPlatform,
        filterUrl: form.filterUrl,
        filterType: form.filterType,
        instructions: form.filterInstructions,
      };

      // Step 4: Create campaign
      logDebug("Creating campaign with details:", {
        title: form.title,
        description: form.description,
        target: Number(form.target),
        deadline: new Date(form.deadline).getTime(),
        mainImageUrl,
        filterImageUrl,
        creatorName: form.creatorName,
        category: form.category,
        filterDetails,
      });

      try {
        const campaignId = await PolkadotService.createCampaign(
          form.title,
          form.description,
          Number(form.target),
          new Date(form.deadline).getTime(),
          mainImageUrl,
          filterImageUrl,
          form.creatorName,
          form.category,
          filterDetails
        );

        if (campaignId) {
          logDebug("Campaign created successfully with ID:", campaignId);
          
          setSuccessMessage(
            `Campaign created successfully! Redirecting to campaign page...`
          );
          setNotificationVisible(true);

          // Navigate to the campaign details page after a short delay
          setTimeout(() => {
            navigate(`/campaign/${campaignId}`);
          }, 1500);
        } else {
          throw new Error("Failed to create campaign");
        }
      } catch (error: any) {
        // Use the new error parser for blockchain errors
        const parsedError = parsePolkadotError(error);
        
        if (parsedError.code === 'wasm-trap') {
          // For WASM traps, show a more user-friendly message
          setError(
            "The transaction could not be processed. This might be due to invalid input values or network issues. Please try again with simplified data."
          );
        } else {
          // For other errors, show the specific message
          setError(parsedError.message);
        }
        setNotificationVisible(true);
        throw error; // Re-throw to log in console
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      
      if (DEMO_MODE) {
        // In demo mode, show success even after error
        console.log("DEMO MODE: Showing success notification despite error");
        setSuccessMessage("Demo Mode: Campaign created successfully! Redirecting...");
        setNotificationVisible(true);
        
        setTimeout(() => {
          navigate(`/campaign/0`); // Use dummy ID in demo mode
        }, 1500);
        return;
      }
      
      // Only set a generic error if one hasn't been set by specific handlers
      if (!error) {
        setError(
          "Failed to create campaign. Please try again."
        );
        setNotificationVisible(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email submission for storage initialization
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEmailPrompt(false);
    handleSubmit(e);
  };

  const [localDescription, setLocalDescription] = useState(form.description);
  const debouncedSetDescription = React.useMemo(
    () => debounce((value: string) => setForm(prev => ({ ...prev, description: value })), 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // For UI feedback, update a local state immediately
    setLocalDescription(e.target.value);
    // For the actual form state update, use debounced function
    debouncedSetDescription(e.target.value);
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Create a New Campaign
            </h1>
            
            {/* Demo Mode Indicator */}
            {DEMO_MODE && (
              <div className="mb-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-md">
                <strong>Demo Mode Active:</strong> Campaign creation will be simulated for demonstration purposes.
              </div>
            )}

            {error && (
              <Notification
                message={error}
                type="error"
                isVisible={notificationVisible}
                onClose={() => setNotificationVisible(false)}
              />
            )}

            {successMessage && (
              <Notification
                message={successMessage}
                type="success"
                isVisible={notificationVisible}
                onClose={() => setNotificationVisible(false)}
              />
            )}

            {/* Email prompt modal */}
            {showEmailPrompt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
                  <h3 className="text-xl font-semibold mb-4">Email Required</h3>
                  <p className="mb-4">Please provide your email to continue with campaign creation.</p>
                  <form onSubmit={handleEmailSubmit}>
                    <input
                      type="email"
                      className="w-full p-2 mb-4 border rounded"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 border rounded"
                        onClick={() => setShowEmailPrompt(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              {/* Basic Campaign Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-500">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Give your campaign a catchy title"
                      value={form.title}
                      onChange={(e) => handleFormFieldChange('title', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
                      maxLength={50}
                      required
                    />
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {form.title.length}/50 characters
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Campaign Description *
                    </label>
                    <textarea
                      placeholder="Describe your campaign and its social impact"
                      value={localDescription}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 h-32"
                      maxLength={500}
                      required
                    />
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {form.description.length}/500 characters
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => handleFormFieldChange('category', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800"
                      aria-label="Campaign Category"
                      required
                    >
                      <option value="Education">Education</option>
                      <option value="Environment">Environment</option>
                      <option value="Health">Health</option>
                      <option value="Equality">Equality</option>
                      <option value="Peace">Peace & Justice</option>
                      <option value="Economic">Economic Growth</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Creator Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your name or organization name"
                      value={form.creatorName}
                      onChange={(e) => handleFormFieldChange('creatorName', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
                      maxLength={50}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Funding Target (DOT) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Amount in DOT"
                      value={form.target}
                      onChange={(e) => handleFormFieldChange('target', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Minimum 0.1 DOT
                    </div>
                  </div>
                  
                        <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="campaign-deadline">
                          Campaign Deadline *
                        </label>
                        <input
                          id="campaign-deadline"
                          type="date"
                          value={form.deadline}
                          onChange={(e) => handleFormFieldChange('deadline', e)}
                          min={minDate}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800"
                          required
                          aria-label="Campaign Deadline"
                          title="Select the end date for your campaign"
                        />
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Choose a date when your campaign will end
                        </div>
                        </div>
                </div>
              </div>
              
              {/* Campaign Imagery */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-500">
                  Campaign Imagery
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Main Campaign Image *
                    </label>
                    
                    <div className="mt-2 flex justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 relative">
                      {form.mainImage ? (
                        <div className="text-center">
                          <img
                            src={form.mainImage}
                            alt="Main campaign"
                            className="mx-auto h-40 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm({ ...form, mainImage: '' });
                              setMainImageFile(null);
                              setMainImageUploadProgress(0);
                            }}
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-center relative">
                          <div className="flex flex-col items-center justify-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                              />
                            </svg>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'main')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Upload main campaign image"
                            aria-label="Upload main campaign image"
                          />
                        </div>
                      )}
                    </div>
                    
                    {mainImageUploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${mainImageUploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Uploading: {mainImageUploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Filter QR Code/Preview (Optional)
                    </label>
                    
                    <div className="mt-2 flex justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 relative">
                      {form.filterImage ? (
                        <div className="text-center">
                          <img
                            src={form.filterImage}
                            alt="Filter preview"
                            className="mx-auto h-40 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm({ ...form, filterImage: '' });
                              setFilterImageFile(null);
                              setFilterImageUploadProgress(0);
                            }}
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-center relative">
                          <div className="flex flex-col items-center justify-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                              />
                            </svg>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Upload a QR code or filter preview
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'filter')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Upload filter QR code or preview image"
                            aria-label="Upload filter QR code or preview image"
                          />
                        </div>
                      )}
                    </div>
                    
                    {filterImageUploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${filterImageUploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Uploading: {filterImageUploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* AR Filter Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-500">
                  AR Filter Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Filter Platform
                    </label>
                    <select
                      value={form.filterPlatform}
                      onChange={(e) => handleFormFieldChange('filterPlatform', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800"
                      aria-label="Filter Platform"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Snapchat">Snapchat</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Meta">Meta Spark</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Filter Type
                    </label>
                    <select
                      value={form.filterType}
                      onChange={(e) => handleFormFieldChange('filterType', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800"
                      aria-label="Filter Type"
                    >
                      <option value="Face">Face Filter</option>
                      <option value="World">World Effect</option>
                      <option value="Background">Background Effect</option>
                      <option value="Interactive">Interactive Game</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Filter URL
                    </label>
                    <input
                      type="url"
                      placeholder="URL to access the filter"
                      value={form.filterUrl}
                      onChange={(e) => handleFormFieldChange('filterUrl', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Usage Instructions
                    </label>
                    <textarea
                      placeholder="How to access and use the filter"
                      value={form.filterInstructions}
                      onChange={(e) => handleFormFieldChange('filterInstructions', e)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 h-24"
                      maxLength={200}
                    />
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {form.filterInstructions.length}/200 characters
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form Submission */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-lg transition-colors ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner />
                      <span className="ml-2">Creating Campaign...</span>
                    </div>
                  ) : (
                    "Create Campaign"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCampaign;