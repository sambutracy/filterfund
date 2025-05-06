import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { globalCache } from '../utils/cache';
import { config } from '../config/env';
import axios from 'axios';

// Import your contract ABI
import contractAbi from '../contracts/filterfundnew.json';

// Types
export interface Filter {
  platform: string;
  filterType: string;  // Changed from filter_type
  instructions: string;
  filterUrl: string;   // Changed from filter_url
}

// Add Donation interface
export interface Donation {
  id: string;
  campaignId: string;
  donor: string;
  amount: number;
  timestamp: number;
  message?: string;
  isAnonymous?: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  filterImage: string;
  category: string;
  target: number;
  amountCollected: number;
  isActive: boolean;
  creatorName: string;
  creator: string;
  deadline: number;
  filter: Filter;
  donations?: Donation[]; // Add optional donations array
}

export class PolkadotService {
  private static api: ApiPromise | null = null;
  private static contract: ContractPromise | null = null;
  private static CONTRACT_ADDRESS = config.contractAddress;
  private static ENDPOINT = config.polkadotEndpoint;

  static async connectToPolkadot(): Promise<ApiPromise> {
    if (!this.api || !this.api.isConnected) {
      if (this.api) {
        // Properly disconnect existing connection first
        await this.api.disconnect();
        this.api = null;
      }
      
      const provider = new WsProvider(this.ENDPOINT);
      this.api = await ApiPromise.create({ provider });
    }
    return this.api;
  }

  static async getContract(): Promise<ContractPromise> {
    if (!this.contract) {
      const api = await this.connectToPolkadot();
      this.contract = new ContractPromise(api, contractAbi, this.CONTRACT_ADDRESS);
    }
    return this.contract;
  }

  static async connectWallet(): Promise<any[]> {
    await web3Enable('FilterFund AR Platform');
    return await web3Accounts();
  }

  static async getAllCampaigns(): Promise<Campaign[]> {
    const cacheKey = 'all-campaigns';
    const cachedData = globalCache.get<Campaign[]>(cacheKey);
    
    if (cachedData) return cachedData;
    
    try {
      const contract = await this.getContract();
      const { result, output } = await contract.query.getAllCampaigns(
        '', 
        { gasLimit: -1 }
      );
      
      if (result.isOk && output) {
        const outputData = output.toHuman();
        const campaignsData = Array.isArray(outputData) ? outputData : [];
        const campaigns = this.formatCampaigns(campaignsData);
        globalCache.set(cacheKey, campaigns, 30);
        return campaigns;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return [];
    }
  }

  static async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const contract = await this.getContract();
      const { result, output } = await contract.query.getCampaign(
        '',
        { gasLimit: -1 },
        parseInt(id)
      );
      
      if (result.isOk && output && !output.isEmpty) {
        return this.formatCampaign(output.toHuman());
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting campaign ${id}:`, error);
      return null;
    }
  }

  static async createCampaign(
    title: string,
    description: string,
    target: number,
    deadline: number,
    mainImage: string,
    filterImage: string,
    creatorName: string,
    category: string,
    filter: Filter
  ): Promise<string> {
    try {
      // Ensure we have a valid connection before proceeding
      const api = await this.connectToPolkadot();
      if (!api.isConnected) {
        throw new Error('Not connected to Polkadot network');
      }
      
      const accounts = await this.connectWallet();
      if (!accounts.length) throw new Error('No wallet accounts found');
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);

      // Validate and format target amount (minimum 1 SBY)
      const MIN_TARGET = 1_000_000_000_000; // 1 SBY in planck units
      const targetValue = Math.max(MIN_TARGET, Math.floor(Number(target) * 10**12));
      
      // Validate and format deadline
      const now = Date.now();
      const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);
      const validDeadline = Math.max(now + 86400000, Math.min(deadline, oneYearFromNow));
      
      // Sanitize string inputs
      const sanitizedTitle = title.substring(0, 50).trim();
      const sanitizedDescription = description.substring(0, 500).trim();
      const sanitizedMainImage = mainImage.substring(0, 200).trim();
      const sanitizedFilterImage = filterImage.substring(0, 200).trim();
      const sanitizedCreatorName = creatorName.substring(0, 50).trim();
      const sanitizedCategory = category.substring(0, 50).trim();
      
      // Log the parameters for debugging
      console.log('Creating campaign with parameters:', {
        title: sanitizedTitle,
        description: `${sanitizedDescription.length} chars`,
        mainImage: sanitizedMainImage,
        filterImage: sanitizedFilterImage,
        category: sanitizedCategory,
        target: targetValue.toString(),
        deadline: validDeadline.toString(),
        filter: {
          platform: filter.platform,
          filterType: filter.filterType,
          instructions: filter.instructions,
          filterUrl: filter.filterUrl
        }
      });
      
      const tx = await contract.tx.createCampaign(
        { gasLimit: 200000000, storageDepositLimit: null },
        sanitizedTitle,
        sanitizedDescription,
        sanitizedMainImage,
        sanitizedFilterImage,
        sanitizedCategory,
        targetValue,
        validDeadline,
        {
          platform: filter.platform,
          filter_type: filter.filterType,
          instructions: filter.instructions,
          filter_url: filter.filterUrl
        },
        sanitizedCreatorName
      );
      
      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | null = null;
        let hasCompleted = false;
        
        tx.signAndSend(
          accountAddress,
          { signer: injector.signer },
          (result) => {
            console.log('Transaction status:', result.status.type);
            
            if (result.dispatchError) {
              if (!hasCompleted) {
                hasCompleted = true;
                const errorMessage = result.dispatchError.toString();
                console.error('Dispatch error:', errorMessage);
                if (unsubscribe) unsubscribe();
                reject(new Error(errorMessage));
              }
              return;
            }
            
            if ((result.status.isInBlock || result.status.isFinalized) && !hasCompleted) {
              hasCompleted = true;
              console.log(`Transaction included in block: ${result.status.isInBlock ? result.status.asInBlock.toString() : result.status.asFinalized.toString()}`);
              if (unsubscribe) unsubscribe();
              resolve("0");
            }
          }
        ).then(unsub => {
          unsubscribe = unsub;
        }).catch(error => {
          console.error('Sign and send error:', error);
          if (!hasCompleted) {
            hasCompleted = true;
            if (unsubscribe) unsubscribe();
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Update to support message and isAnonymous
  static async donateToCampaign(
    campaignId: string, 
    amount: number,
    message: string = '', 
    isAnonymous: boolean = false
  ): Promise<boolean> {
    try {
      const accounts = await this.connectWallet();
      if (!accounts.length) throw new Error('No wallet accounts found');
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);
      
      // Note: message and isAnonymous are client-side only since the contract doesn't support them
      console.log(`Donation message: ${message}, Anonymous: ${isAnonymous}`);
      
      const tx = await contract.tx.donateToCampaign(
        { 
          gasLimit: 1000000000,
          value: amount.toString() 
        },
        parseInt(campaignId)
      );
      
      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | null = null;
        
        tx.signAndSend(
          accountAddress,
          { signer: injector.signer },
          (result) => {
            if (result.status.isFinalized) {
              // Clean up subscription when done
              if (unsubscribe) {
                unsubscribe();
              }
              resolve(true);
            }
          }
        ).then(unsub => {
          unsubscribe = unsub;
        }).catch(error => {
          if (unsubscribe) {
            unsubscribe();
          }
          reject(error);
        });
      });
    } catch (error) {
      console.error(`Error donating to campaign ${campaignId}:`, error);
      return false;
    }
  }

  // Add missing methods for compatibility
  static async ensureW3Storage(email: string): Promise<void> {
    // Simplified implementation that does nothing but log
    console.log(`Email used for identification: ${email}`);
    return Promise.resolve();
  }

  static async uploadAsset(file: File, type: string): Promise<string> {
    try {
      // Use axios for Pinata upload
      const formData = new FormData();
      formData.append('file', file);
      
      const pinataJwt = config.pinataJwt;
      if (!pinataJwt) {
        throw new Error('Pinata JWT not configured');
      }
      
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${pinataJwt}`
          }
        }
      );
      
      if (response.data && response.data.IpfsHash) {
        return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  }

  static async getTopCampaigns(limit: number = 10): Promise<Campaign[]> {
    const campaigns = await this.getAllCampaigns();
    // Sort by amount collected and take the top ones
    return campaigns
      .sort((a, b) => b.amountCollected - a.amountCollected)
      .slice(0, limit);
  }

  static async getAllFilters(): Promise<Filter[]> {
    try {
      const campaigns = await this.getAllCampaigns();
      // Extract unique filters from campaigns
      const uniqueFilters = new Map<string, Filter>();
      
      campaigns.forEach(campaign => {
        if (campaign.filter && campaign.filter.filterUrl) {
          uniqueFilters.set(campaign.filter.filterUrl, campaign.filter);
        }
      });
      
      return Array.from(uniqueFilters.values());
    } catch (error) {
      console.error('Error getting filters:', error);
      return [];
    }
  }

  // Add this to your PolkadotService class
  static async verifyContractConnection(): Promise<boolean> {
    try {
      console.log('Verifying contract connection...');
      const contract = await this.getContract();
      
      // Try to get blockchain time (a simple read-only call)
      const { result, output } = await contract.query.getCurrentBlockchainTime(
        '',
        { gasLimit: -1 }
      );
      
      if (result.isOk && output) {
        const blockchainTime = output.toHuman();
        console.log('Contract is accessible, blockchain time:', blockchainTime);
        return true;
      }
      
      console.error('Contract query failed:', result.toString());
      return false;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.api && this.api.isConnected) {
      try {
        await this.api.disconnect();
        console.log('Disconnected from blockchain');
      } catch (error) {
        console.error('Error disconnecting:', error);
      } finally {
        this.api = null;
      }
    }
  }

  private static formatCampaign(campaignData: any): Campaign | null {
    if (!campaignData) return null;
    
    return {
      id: campaignData.id,
      title: sanitizeString(campaignData.title, 50),
      description: sanitizeString(campaignData.description, 500),
      creator: campaignData.creator,
      creatorName: sanitizeString(campaignData.creatorName, 50),
      mainImage: campaignData.mainImage,
      filterImage: campaignData.filterImage || '',
      category: campaignData.category,
      target: parseInt(campaignData.target.replace(/,/g, '')),
      amountCollected: parseInt(campaignData.amountCollected.replace(/,/g, '')),
      deadline: parseInt(campaignData.deadline.replace(/,/g, '')),
      isActive: campaignData.isActive,
      filter: {
        platform: campaignData.filter.platform,
        filterType: campaignData.filter.filter_type,  // Map from snake_case to camelCase
        instructions: campaignData.filter.instructions,
        filterUrl: campaignData.filter.filter_url     // Map from snake_case to camelCase
      },
      donations: [] // Initialize with empty array
    };
  }

  private static formatCampaigns(campaignsData: any[]): Campaign[] {
    return campaignsData
      .map(campaign => this.formatCampaign(campaign))
      .filter((campaign): campaign is Campaign => campaign !== null);
  }
}

// Add these sanitization functions:

function sanitizeString(input: string, maxLength: number): string {
  if (!input) return '';
  return input.substring(0, maxLength).trim();
}