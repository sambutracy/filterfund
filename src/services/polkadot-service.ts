import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { ContractPromise } from '@polkadot/api-contract';
import { AnyJson } from '@polkadot/types/types';
import { config } from '../config/env';

// Update config to include contract details
export const enhancedConfig = {
  ...config,
  useContractInterface: true,
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || '5C...your contract address',
  // The ABI will come from your compiled contract's metadata.json
  contractAbi: process.env.REACT_APP_CONTRACT_ABI || {} as AnyJson
};

let api: ApiPromise | null = null;
let contract: ContractPromise | null = null;

export class PolkadotService {
  static async connectToPolkadot(endpoint = enhancedConfig.polkadotEndpoint): Promise<ApiPromise> {
    if (api) return api;
    
    try {
      console.log('Connecting to Polkadot node:', endpoint);
      const wsProvider = new WsProvider(endpoint);
      
      api = await ApiPromise.create({ provider: wsProvider });
      console.log(`Connected to ${(await api.rpc.system.chain()).toString()}`);
      
      return api;
    } catch (error) {
      console.error('Failed to connect to Polkadot node:', error);
      throw error;
    }
  }
  
  static async getContract(): Promise<ContractPromise> {
    if (contract) return contract;
    
    const api = await this.connectToPolkadot();
    contract = new ContractPromise(api, enhancedConfig.contractAbi, enhancedConfig.contractAddress);
    return contract;
  }

  static async getAllCampaigns(): Promise<Campaign[]> {
    try {
      if (enhancedConfig.useContractInterface && enhancedConfig.contractAddress) {
        const contract = await this.getContract();
        const { result, output } = await contract.query.getAllCampaigns(
          '', // Contract caller (empty for read-only)
          {}
        );
        
        if (result.isOk && output) {
          // Parse output to Campaign[] format
          const campaigns = output.toHuman() as any[];
          return campaigns.map(campaign => ({
            id: campaign.id.toString(),
            title: campaign.title,
            description: campaign.description,
            mainImage: campaign.mainImage,
            filterImage: campaign.filterImage,
            category: campaign.category,
            target: BigInt(campaign.target.replace(/,/g, '')),
            amountCollected: BigInt(campaign.amountCollected.replace(/,/g, '')),
            isActive: campaign.isActive,
            creatorName: campaign.creatorName,
            creator: campaign.creator,
            deadline: parseInt(campaign.deadline.replace(/,/g, '')),
            filter: {
              platform: campaign.filter.platform,
              filterType: campaign.filter.filterType,
              instructions: campaign.filter.instructions,
              filterUrl: campaign.filter.filterUrl
            }
          }));
        }
      }
      
      // Fallback to mock data
      return this.getMockCampaigns();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return this.getMockCampaigns();
    }
  }

  static async createCampaign(campaign: {
    title: string;
    description: string;
    mainImage: string;
    filterImage: string;
    category: string;
    target: bigint;
    deadline: number;
    filter: {
      platform: string;
      filterType: string;
      instructions: string;
      filterUrl: string;
    };
    creatorName: string;
  }): Promise<string> {
    try {
      const accounts = await this.connectWallet();
      if (!accounts.length) {
        throw new Error('No wallet accounts found');
      }
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);
      
      // Format target amount according to chain decimals
      const api = await this.connectToPolkadot();
      const decimals = api.registry.chainDecimals[0];
      const targetValue = (campaign.target * BigInt(10 ** decimals)).toString();
      
      // Call contract to create campaign
      const tx = await contract.tx.createCampaign(
        {}, // Options like gas limit
        campaign.title,
        campaign.description,
        campaign.mainImage,
        campaign.filterImage,
        campaign.category,
        targetValue,
        campaign.deadline,
        campaign.filter,
        campaign.creatorName
      );
      
      // Sign and send transaction
      const result = await tx.signAndSend(accountAddress, { signer: injector.signer });
      
      return result.toString(); // Returns transaction hash
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  static async donateToCampaign(campaignId: string, amount: number): Promise<string> {
    try {
      const accounts = await this.connectWallet();
      if (!accounts.length) {
        throw new Error('No wallet accounts found');
      }
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);
      
      // Format amount according to chain decimals
      const api = await this.connectToPolkadot();
      const decimals = api.registry.chainDecimals[0];
      const donationValue = (BigInt(amount) * BigInt(10 ** decimals)).toString();
      
      // Call contract to donate
      const tx = await contract.tx.donateToCampaign(
        { value: donationValue }, // Include value in transaction
        campaignId
      );
      
      // Sign and send transaction
      const result = await tx.signAndSend(accountAddress, { signer: injector.signer });
      
      return result.toString(); // Returns transaction hash
    } catch (error) {
      console.error('Error donating to campaign:', error);
      throw error;
    }
  }

  static async connectWallet() {
    try {
      const extensions = await web3Enable('FilterFund AR Platform');
      
      if (extensions.length === 0) {
        throw new Error('No extensions found. Please install the Polkadot{.js} extension');
      }
      
      const accounts = await web3Accounts();
      return accounts;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }
}