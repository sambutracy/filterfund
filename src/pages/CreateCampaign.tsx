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
    image: ''
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