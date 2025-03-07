import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '',
    deadline: '',
    image: '',
    filterUrl: ''
  });

  const handleFormFieldChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [fieldName]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add your submission logic here
    setIsLoading(false);
    navigate('/');
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
        <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-6">
          Create New Campaign
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => handleFormFieldChange('name', e)}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter campaign title"
                value={form.title}
                onChange={(e) => handleFormFieldChange('title', e)}
              />
              <div>
  <label className="block text-gray-700 dark:text-gray-300 mb-2">
    AR Filter Upload *
  </label>
  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
    <div className="mb-3">
      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500">
          <span>Upload a file</span>
          <input 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            className="sr-only" 
            accept=".jpg,.jpeg,.png,.gif,.mp4,.lens,.filter"
            onChange={(e) => {
              // Handle file change
              if (e.target.files && e.target.files[0]) {
                // Here you'd usually upload to storage and get a URL
                console.log("File selected:", e.target.files[0]);
              }
            }}
          />
        </label>
        <p className="pl-1">or drag and drop</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        PNG, JPG, GIF up to 10MB (AR filter files also accepted)
      </p>
    </div>
  </div>
</div>

<div>
  <label className="block text-gray-700 dark:text-gray-300 mb-2">
    Filter URL (Snapchat, Instagram, etc) *
  </label>
  <input
    type="url"
    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
    placeholder="https://lens.snapchat.com/your-filter-url"
    value={form.filterUrl || ''}
    onChange={(e) => handleFormFieldChange('filterUrl', e)}
  />
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    Add a direct link to your filter on the social media platform
  </p>
</div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Story *
            </label>
            <textarea
              className="w-full p-2 border rounded-lg h-32 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Write your story"
              value={form.description}
              onChange={(e) => handleFormFieldChange('description', e)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Goal Amount *
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="ETH 0.50"
                value={form.target}
                onChange={(e) => handleFormFieldChange('target', e)}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={form.deadline}
                onChange={(e) => handleFormFieldChange('deadline', e)}
                title="Campaign end date"
                placeholder="Select end date"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Campaign Image *
            </label>
            <input
              type="url"
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="Place image URL of your campaign"
              value={form.image}
              onChange={(e) => handleFormFieldChange('image', e)}
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </motion.div>
    </Layout>
  );
};

export default CreateCampaign;