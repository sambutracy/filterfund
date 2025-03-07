// src/services/api.ts
// This is a placeholder service for API calls
// Replace with actual API implementation

export interface Campaign {
    id: string;
    title: string;
    description: string;
    target: number;
    deadline: number;
    amountCollected: number;
    image: string;
    creator: string;
    creatorName?: string;
    category?: string;
    filter?: {
      platform: string;
      filterUrl: string;
      previewImage: string;
      filterType: string;
      instructions: string;
    };
  }
  
  export interface User {
    id: string;
    username: string;
    email: string;
    bio?: string;
    socialLinks?: string[];
    created?: number;
  }
  
  export interface Filter {
    id: string;
    title: string;
    image: string;
    filterUrl: string;
    category: string;
    creator: string;
    platform: string;
    instructions: string;
  }
  
  // Mock data
  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      title: 'Women Empowerment Campaign',
      description: 'Supporting women\'s rights initiatives around the world.',
      target: 5000,
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      amountCollected: 2500,
      image: 'https://via.placeholder.com/400x300/FF69B4/FFFFFF?text=Women+Empowerment',
      creator: '0x12345...',
      creatorName: 'Jane Smith',
      category: 'Equality',
      filter: {
        platform: 'Snapchat',
        filterUrl: 'https://example.com/filter/1',
        previewImage: 'https://via.placeholder.com/400x300/FF69B4/FFFFFF?text=Filter+Preview',
        filterType: 'face',
        instructions: 'Open Snapchat and scan this code'
      }
    },
    {
      id: '2',
      title: 'Environmental Protection',
      description: 'Cleaning up oceans and forests to preserve our planet.',
      target: 10000,
      deadline: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
      amountCollected: 3000,
      image: 'https://via.placeholder.com/400x300/00CED1/FFFFFF?text=Environmental',
      creator: '0x67890...',
      creatorName: 'John Doe',
      category: 'Environment',
      filter: {
        platform: 'Instagram',
        filterUrl: 'https://example.com/filter/2',
        previewImage: 'https://via.placeholder.com/400x300/00CED1/FFFFFF?text=Filter+Preview',
        filterType: 'world',
        instructions: 'Open Instagram and search for this filter'
      }
    }
  ];
  
  const mockFilters: Filter[] = [
    {
      id: '1',
      title: 'Women Empowerment Filter',
      image: 'https://via.placeholder.com/400x300/FF69B4/FFFFFF?text=Women+Empowerment',
      filterUrl: 'https://example.com/filter/1',
      category: 'Equality',
      creator: 'Jane Doe',
      platform: 'Snapchat',
      instructions: 'Open Snapchat and scan this code'
    },
    {
      id: '2',
      title: 'Climate Action Face Filter',
      image: 'https://via.placeholder.com/400x300/00CED1/FFFFFF?text=Climate+Action',
      filterUrl: 'https://example.com/filter/2',
      category: 'Environment',
      creator: 'John Smith',
      platform: 'Instagram',
      instructions: 'Open Instagram and search for this filter'
    },
    {
      id: '3',
      title: 'Education For All',
      image: 'https://via.placeholder.com/400x300/FFD700/FFFFFF?text=Education',
      filterUrl: 'https://example.com/filter/3',
      category: 'Education',
      creator: 'Maria Garcia',
      platform: 'TikTok',
      instructions: 'Open TikTok and search for this effect'
    },
    {
      id: '4',
      title: 'Healthcare Awareness',
      image: 'https://via.placeholder.com/400x300/FF6347/FFFFFF?text=Healthcare',
      filterUrl: 'https://example.com/filter/4',
      category: 'Health',
      creator: 'David Lee',
      platform: 'Snapchat',
      instructions: 'Open Snapchat and scan this code'
    }
  ];
  
  // API Service
  export const API = {
    // Campaign methods
    getCampaigns: async (): Promise<Campaign[]> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve(mockCampaigns), 500);
      });
    },
  
    getCampaignById: async (id: string): Promise<Campaign | undefined> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve(mockCampaigns.find(c => c.id === id)), 500);
      });
    },
  
    createCampaign: async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
      // Simulate API call
      return new Promise(resolve => {
        const newCampaign = {
          ...campaign,
          id: Math.random().toString(36).substring(2, 9)
        };
        setTimeout(() => resolve(newCampaign), 500);
      });
    },
  
    donateToCampaign: async (campaignId: string, amount: number): Promise<boolean> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 500);
      });
    },
  
    getUserCampaigns: async (userId: string): Promise<Campaign[]> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve(mockCampaigns.filter(c => c.creator === userId)), 500);
      });
    },
  
    // Filter methods
    getFilters: async (): Promise<Filter[]> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve(mockFilters), 500);
      });
    },
  
    getFilterById: async (id: string): Promise<Filter | undefined> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve(mockFilters.find(f => f.id === id)), 500);
      });
    },
  
    recordFilterUse: async (filterId: string): Promise<boolean> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 500);
      });
    },
  
    // User methods
    registerUser: async (user: Omit<User, 'id'>): Promise<User> => {
      // Simulate API call
      return new Promise(resolve => {
        const newUser = {
          ...user,
          id: Math.random().toString(36).substring(2, 9),
          created: Date.now()
        };
        setTimeout(() => resolve(newUser), 500);
      });
    },
  
    getUserProfile: async (userId: string): Promise<User | null> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve({
          id: userId,
          username: 'User' + userId.substring(0, 4),
          email: `user${userId.substring(0, 4)}@example.com`,
          bio: 'This is a mock user profile'
        }), 500);
      });
    },
  
    updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => resolve({
          id: userId,
          username: updates.username || 'User' + userId.substring(0, 4),
          email: updates.email || `user${userId.substring(0, 4)}@example.com`,
          bio: updates.bio || 'This is a mock user profile',
          socialLinks: updates.socialLinks || []
        }), 500);
      });
    }
  };
  
  export default API;