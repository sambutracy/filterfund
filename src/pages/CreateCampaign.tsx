import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { PolkadotService } from "../services/polkadot-service";
import LoadingSpinner from "../components/LoadingSpinner";
import { usePrivy } from '@privy-io/react-auth';
import Notification from "../components/Notification";
import { debounce } from '../utils/debounce';

// Configure logging for debugging
const ENABLE_DEBUG_LOGGING = true;
const logDebug = (...args: any[]) => {
  if (ENABLE_DEBUG_LOGGING) {
    console.log('[CreateCampaign]', ...args);
  }
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);

  // File state variables
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [filterImageFile, setFilterImageFile] = useState<File | null>(null);

  // Upload progress state
  const [mainImageUploadProgress, setMainImageUploadProgress] = useState(0);
  const [filterImageUploadProgress, setFilterImageUploadProgress] = useState(0);

  // Add this to actually use the progress indicators
  const UploadProgress = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
      <div 
        className={`bg-red-600 h-2.5 rounded-full w-[${progress}%]`}
      ></div>
      <span className="text-xs text-gray-500">{progress}% uploaded</span>
    </div>
  );

  // Form state
  const [form, setForm] = useState({
    creatorName: user?.email?.address || "",
    title: "",
    description: "",
    target: "",
    deadline: "",
    mainImage: "",
    mainImagePreview: "",
    filterImage: "",
    filterImagePreview: "",
    category: "Education",
    filterPlatform: "Snapchat",
    filterUrl: "",
    filterType: "Face Filter",
    filterInstructions: "",
  });

  // Add a state for email
  const [email, setEmail] = useState<string>('');
  const [showEmailPrompt, setShowEmailPrompt] = useState<boolean>(false);

  // Handle form field changes
  const handleFormFieldChange = (
    fieldName: string,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  // Handle file input changes
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
    }
  };

  const handleFilterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFilterImageFile(e.target.files[0]);
    }
  };

  // Handle form submission
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
    } catch (error) {
      console.error("Error creating campaign:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create campaign. Please try again."
      );
      setNotificationVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    if (!form.creatorName) {
      setError("Please enter your name");
      setNotificationVisible(true);
      return false;
    }

    if (!form.title) {
      setError("Please enter a campaign title");
      setNotificationVisible(true);
      return false;
    }

    if (!form.description) {
      setError("Please enter a campaign description");
      setNotificationVisible(true);
      return false;
    }

    if (
      !form.target ||
      isNaN(Number(form.target)) ||
      Number(form.target) <= 0
    ) {
      setError("Please enter a valid funding target");
      setNotificationVisible(true);
      return false;
    }

    if (!form.deadline) {
      setError("Please select an end date");
      setNotificationVisible(true);
      return false;
    }

    const deadlineDate = new Date(form.deadline);
    if (deadlineDate <= new Date()) {
      setError("End date must be in the future");
      setNotificationVisible(true);
      return false;
    }

    if (!form.mainImage && !mainImageFile) {
      setError("Please provide a main campaign image");
      setNotificationVisible(true);
      return false;
    }

    if (!form.filterUrl) {
      setError("Please enter the filter URL");
      setNotificationVisible(true);
      return false;
    }

    return true;
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

  // Add an email prompt component
  const EmailPrompt = () => {
    // Local state for email validation
    const [isValidEmail, setIsValidEmail] = useState(false);
    
    // Email validation function
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    // Handle email input change with validation
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      setIsValidEmail(validateEmail(newEmail));
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Email Required</h2>
          <p className="mb-4">
            We need your email to set up secure storage for your campaign images.
          </p>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full p-2 border rounded ${
                email && !isValidEmail ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
              placeholder="your@email.com"
              autoFocus
            />
            {email && !isValidEmail && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowEmailPrompt(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (isValidEmail) {
                  setShowEmailPrompt(false);
                  handleSubmit(new Event('submit') as any);
                }
              }}
              className={`px-4 py-2 bg-red-600 text-white rounded transition-colors ${
                isValidEmail ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!isValidEmail}
              type="button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Clean up WebSocket connections when component unmounts
    return () => {
      PolkadotService.disconnect();
    };
  }, []);

  return (
    <Layout>
      <div className="text-3xl font-bold text-red-600 dark:text-red-500 mb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Create New Campaign
        </motion.div>
      </div>

      {/* Notification component */}
      <Notification
        message={error || successMessage || ""}
        type={error ? "error" : "success"}
        isVisible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-3xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creator Info */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Your Name *
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              placeholder="John Doe"
              value={form.creatorName}
              onChange={(e) => handleFormFieldChange("creatorName", e)}
            />
          </div>

          {/* Campaign Title */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Campaign Title *
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter campaign title"
              value={form.title}
              onChange={(e) => handleFormFieldChange("title", e)}
            />
          </div>
        </div>

        {/* Campaign Description */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Campaign Description *
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-32 dark:bg-gray-700 dark:text-gray-200"
            placeholder="Tell people about your campaign and why they should support it"
            value={localDescription}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Funding Target */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Funding Target (DOT) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              placeholder="0.00"
              value={form.target}
              onChange={(e) => handleFormFieldChange("target", e)}
            />
          </div>

          {/* End Date */}
          <div>
            <label
              className="block text-gray-700 dark:text-gray-300 mb-2 font-medium"
              htmlFor="deadline"
            >
              End Date *
            </label>
            <input
              id="deadline"
              type="date"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              value={form.deadline}
              onChange={(e) => handleFormFieldChange("deadline", e)}
              title="Select campaign end date"
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campaign Category */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Category *
            </label>
            <select
              aria-label="Campaign Category"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              value={form.category}
              onChange={(e) => handleFormFieldChange("category", e)}
            >
              {CauseCategories.map((category) => (
                <option key={category} value={category}>
                  {category === "HumanRights"
                    ? "Human Rights"
                    : category === "AnimalWelfare"
                    ? "Animal Welfare"
                    : category}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Platform */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Filter Platform *
            </label>
            <select
              aria-label="Filter Platform"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              value={form.filterPlatform}
              onChange={(e) => handleFormFieldChange("filterPlatform", e)}
            >
              {FilterPlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campaign Main Image */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Campaign Main Image *
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                title="Upload campaign main image"
                placeholder="Choose a main image for your campaign"
              />
            </div>
          </div>
          {mainImageUploadProgress > 0 && mainImageUploadProgress < 100 && (
            <UploadProgress progress={mainImageUploadProgress} />
          )}
        </div>

        {/* Filter QR Code Image */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Filter QR Code Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFilterImageChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
            title="Upload filter QR code image"
            placeholder="Choose a QR code image for your filter"
          />
          {filterImageUploadProgress > 0 && filterImageUploadProgress < 100 && (
            <UploadProgress progress={filterImageUploadProgress} />
          )}
        </div>

        {/* Filter details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Filter Details
          </h3>

          <div className="space-y-4">
            {/* Filter URL */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Filter URL (Snapchat, Instagram, etc) *
              </label>
              <input
                type="url"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                placeholder="https://lens.snapchat.com/your-filter-url"
                value={form.filterUrl}
                onChange={(e) => handleFormFieldChange("filterUrl", e)}
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Add a direct link to your filter on the social media platform
              </p>
            </div>

            {/* Filter Type */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Filter Type
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                placeholder="Face Filter, World Effect, etc."
                value={form.filterType}
                onChange={(e) => handleFormFieldChange("filterType", e)}
              />
            </div>

            {/* Filter Instructions */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Usage Instructions
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                placeholder="How to use this filter (e.g., Scan the QR code with Snapchat, open your camera and...)"
                value={form.filterInstructions}
                onChange={(e) => handleFormFieldChange("filterInstructions", e)}
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-lg font-medium text-lg shadow-lg transform transition hover:scale-105 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Creating...</span>
              </div>
            ) : (
              "Create Campaign"
            )}
          </button>
        </div>
      </form>

      {showEmailPrompt && <EmailPrompt />}
    </Layout>
  );
};

export default CreateCampaign;