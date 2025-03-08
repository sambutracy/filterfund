import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CanisterService } from '../services/canister';
import LoadingSpinner from '../components/LoadingSpinner';

const CauseCategories = [
  'Health',
  'Education',
  'Environment',
  'Equality',
  'Poverty',
  'HumanRights',
  'AnimalWelfare',
  'Other'
];

const FilterPlatforms = [
  'Snapchat',
  'Instagram',
  'TikTok',
  'Facebook',
  'Other'
];

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // File references
  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const filterImageFileRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [form, setForm] = useState({
    creatorName: '',
    title: '',
    description: '',
    target: '',
    deadline: '',
    mainImage: '',
    mainImageFile: null as File | null,
    mainImagePreview: '',
    filterImage: '',
    filterImageFile: null as File | null,
    filterImagePreview: '',
    category: 'Education',
    filterPlatform: 'Snapchat',
    filterUrl: '',
    filterType: 'Face Filter',
    filterInstructions: ''
  });

  // Handle form field changes
  const handleFormFieldChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  // Handle file input changes
  const handleFileChange = (fieldName: 'mainImageFile' | 'filterImageFile', previewField: 'mainImagePreview' | 'filterImagePreview', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create local file preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prevForm => ({
          ...prevForm,
          [fieldName]: file,
          [previewField]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Upload main image
      let mainImageUrl = form.mainImage;
      if (form.mainImageFile) {
        const result = await CanisterService.uploadAsset(form.mainImageFile, 'MainImage');
        if (typeof result === 'string') {
          mainImageUrl = result;
        } else {
          throw new Error("Failed to upload main image");
        }
      }
      
      // Upload filter image
      let filterImageUrl = form.filterImage;
      if (form.filterImageFile) {
        const result = await CanisterService.uploadAsset(form.filterImageFile, 'FilterImage');
        if (typeof result === 'string') {
          filterImageUrl = result;
        } else {
          throw new Error("Failed to upload filter image");
        }
      }
      
      // Convert deadline to Date object
      const deadlineDate = new Date(form.deadline);
      
      // Create campaign
      const filterDetails = {
        platform: form.filterPlatform,
        filterUrl: form.filterUrl,
        previewImage: filterImageUrl,
        filterType: form.filterType,
        instructions: form.filterInstructions
      };
      
      const result = await CanisterService.createCampaign(
        form.title,
        form.description,
        Number(form.target),
        deadlineDate,
        mainImageUrl,
        filterImageUrl,
        form.creatorName,
        form.category,
        filterDetails
      );
      
      if (typeof result === 'bigint') {
        const campaignId = result.toString();
        setSuccessMessage(`Campaign created successfully! Redirecting to campaign page...`);
        
        // Navigate to the campaign details page after a short delay
        setTimeout(() => {
          navigate(`/campaign/${campaignId}`);
        }, 1500);
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setError(error instanceof Error ? error.message : "Failed to create campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    if (!form.creatorName) {
      setError("Please enter your name");
      return false;
    }
    
    if (!form.title) {
      setError("Please enter a campaign title");
      return false;
    }
    
    if (!form.description) {
      setError("Please enter a campaign description");
      return false;
    }
    
    if (!form.target || isNaN(Number(form.target)) || Number(form.target) <= 0) {
      setError("Please enter a valid funding target");
      return false;
    }
    
    if (!form.deadline) {
      setError("Please select an end date");
      return false;
    }
    
    const deadlineDate = new Date(form.deadline);
    if (deadlineDate <= new Date()) {
      setError("End date must be in the future");
      return false;
    }
    
    if (!form.mainImage && !form.mainImageFile) {
      setError("Please provide a main campaign image");
      return false;
    }
    
    if (!form.filterUrl) {
      setError("Please enter the filter URL");
      return false;
    }
    
    return true;
  };

  return (
    <Layout>
      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Create New Campaign
        </motion.div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
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
              onChange={(e) => handleFormFieldChange('creatorName', e)}
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
              onChange={(e) => handleFormFieldChange('title', e)}
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
            value={form.description}
            onChange={(e) => handleFormFieldChange('description', e)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Funding Target */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Funding Target (ICP) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              placeholder="0.00"
              value={form.target}
              onChange={(e) => handleFormFieldChange('target', e)}
            />
          </div>
          
          {/* End Date */}
            <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="deadline">
              End Date *
            </label>
            <input
              id="deadline"
              type="date"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
              value={form.deadline}
              onChange={(e) => handleFormFieldChange('deadline', e)}
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
              onChange={(e) => handleFormFieldChange('category', e)}
            >
              {CauseCategories.map((category) => (
                <option key={category} value={category}>
                  {category === 'HumanRights' ? 'Human Rights' : 
                   category === 'AnimalWelfare' ? 'Animal Welfare' : category}
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
              onChange={(e) => handleFormFieldChange('filterPlatform', e)}
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
              {form.mainImagePreview ? (
                <div className="mb-4 relative">
                  <img
                    src={form.mainImagePreview}
                    alt="Campaign preview"
                    className="max-h-48 max-w-full rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => setForm({...form, mainImageFile: null, mainImagePreview: ''})}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              
              <div className="flex items-center">
                <label htmlFor="main-image-upload" className="cursor-pointer bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-lg">
                  Choose Image
                  <input
                    id="main-image-upload"
                    type="file"
                    ref={mainImageFileRef}
                    accept="image/*"
                    className="hidden"
                    title="Upload campaign main image"
                    onChange={(e) => handleFileChange('mainImageFile', 'mainImagePreview', e)}
                  />
                </label>
                
                <div className="ml-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  or provide a URL:
                </div>
              </div>
              
              <input
                type="text"
                className="w-full mt-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                placeholder="https://example.com/image.jpg"
                value={form.mainImage}
                onChange={(e) => handleFormFieldChange('mainImage', e)}
              />
            </div>
          </div>
        </div>

        {/* Filter QR Code Image */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Filter QR Code Image
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="flex flex-col items-center">
              {form.filterImagePreview ? (
                <div className="mb-4 relative">
                  <img
                    src={form.filterImagePreview}
                    alt="Filter QR code preview"
                    className="max-h-48 max-w-full rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => setForm({...form, filterImageFile: null, filterImagePreview: ''})}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              
                <label htmlFor="filter-image-upload" className="cursor-pointer bg-lime-100 hover:bg-lime-200 dark:bg-lime-900 dark:hover:bg-lime-800 text-lime-800 dark:text-lime-200 px-4 py-2 rounded-lg">
                  Choose QR Code
                  <input
                    id="filter-image-upload"
                    type="file"
                    ref={filterImageFileRef}
                    accept="image/*"
                    className="hidden"
                    title="Upload filter QR code image"
                    onChange={(e) => handleFileChange('filterImageFile', 'filterImagePreview', e)}
                  />
                </label>
                
                <div className="ml-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  or provide a URL:
                </div>
              </div>
              
              <input
                type="text"
                className="w-full mt-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200"
                placeholder="https://example.com/qrcode.jpg"
                value={form.filterImage}
                onChange={(e) => handleFormFieldChange('filterImage', e)}
              />
            </div>
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
                onChange={(e) => handleFormFieldChange('filterUrl', e)}
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
                onChange={(e) => handleFormFieldChange('filterType', e)}
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
                onChange={(e) => handleFormFieldChange('filterInstructions', e)}
              />
            </div>
          </div>
        </div>

          {/* Submit button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-lime-500 hover:from-orange-600 hover:to-lime-600 text-white rounded-lg font-medium text-lg shadow-lg transform transition hover:scale-105 disabled:opacity-70"
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
    </Layout>
  );
};

export default CreateCampaign;