import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/contracts';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

// Import your contract ABI (generated after building the contract)
import contractAbi from '../contracts/filterfundnew.json';

export class PolkadotService {
  private static api: ApiPromise | null = null;
  private static contract: ContractPromise | null = null;
  
  // Update this with your deployed contract address after deployment
  private static CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
  private static ENDPOINT = process.env.REACT_APP_POLKADOT_ENDPOINT || 'ws://127.0.0.1:9944';

  static async connectToPolkadot(): Promise<ApiPromise> {
    if (!this.api) {
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
    await web3Enable('AR for Equality');
    const accounts = await web3Accounts();
    return accounts;
  }

  static async getAllCampaigns(): Promise<any[]> {
    try {
      const contract = await this.getContract();
      
      // Call the get_all_campaigns method from your contract
      const { result, output } = await contract.query.getAllCampaigns(
        '', // Caller address, empty string for read operations
        { gasLimit: -1 } // Max gas limit for read
      );
      
      if (result.isOk && output) {
        // Convert the contract output to a JavaScript array
        const campaigns = output.toHuman();
        return this.formatCampaigns(campaigns);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return [];
    }
  }

  static async getCampaign(id: string): Promise<any> {
    try {
      const contract = await this.getContract();
      
      // Call the get_campaign method from your contract
      const { result, output } = await contract.query.getCampaign(
        '',
        { gasLimit: -1 },
        parseInt(id)
      );
      
      if (result.isOk && output && !output.isEmpty) {
        // Convert the contract output to a JavaScript object
        const campaign = output.toHuman();
        return this.formatCampaign(campaign);
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
    deadline: Date,
    mainImage: string,
    filterImage: string,
    creatorName: string,
    category: string,
    filter: {
      platform: string,
      filterType: string,
      instructions: string,
      filterUrl: string
    }
  ): Promise<string> {
    try {
      const accounts = await this.connectWallet();
      if (!accounts.length) {
        throw new Error('No wallet accounts found');
      }
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);
      
      // Convert deadline to timestamp (milliseconds)
      const deadlineTimestamp = deadline.getTime();
      
      // Call create_campaign function
      const tx = await contract.tx.createCampaign(
        { gasLimit: 1000000000 },
        title,
        description,
        mainImage,
        filterImage,
        category,
        target.toString(),
        deadlineTimestamp.toString(),
        filter,
        creatorName
      );
      
      const result = await tx.signAndSend(
        accountAddress, 
        { signer: injector.signer }
      );
      
      // Return the campaign ID (you might need to implement event parsing here)
      return '0'; // Placeholder, ideally should return actual campaign ID
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  static async donateToCampaign(campaignId: string, amount: number): Promise<boolean> {
    try {
      const accounts = await this.connectWallet();
      if (!accounts.length) {
        throw new Error('No wallet accounts found');
      }
      
      const contract = await this.getContract();
      const accountAddress = accounts[0].address;
      const injector = await web3FromAddress(accountAddress);
      
      // Call donate_to_campaign function (payable function)
      const tx = await contract.tx.donateToCampaign(
        { 
          gasLimit: 1000000000,
          value: amount.toString() 
        },
        parseInt(campaignId)
      );
      
      await tx.signAndSend(
        accountAddress, 
        { signer: injector.signer }
      );
      
      return true;
    } catch (error) {
      console.error(`Error donating to campaign ${campaignId}:`, error);
      return false;
    }
  }

  // Helper method to format contract campaign data to your frontend format
  private static formatCampaign(campaignData: any): any {
    if (!campaignData) return null;
    
    return {
      id: campaignData.id,
      title: campaignData.title,
      description: campaignData.description,
      creator: campaignData.creator,
      creatorName: campaignData.creatorName,
      mainImage: campaignData.mainImage,
      filterImage: campaignData.filterImage,
      category: campaignData.category,
      target: parseInt(campaignData.target.replace(/,/g, '')),
      amountCollected: parseInt(campaignData.amountCollected.replace(/,/g, '')),
      deadline: parseInt(campaignData.deadline.replace(/,/g, '')),
      isActive: campaignData.isActive,
      filter: {
        platform: campaignData.filter.platform,
        filterType: campaignData.filter.filterType,
        instructions: campaignData.filter.instructions,
        filterUrl: campaignData.filter.filterUrl
      },
      // Add empty donations array for compatibility with your UI
      donations: []
    };
  }

  private static formatCampaigns(campaignsData: any[]): any[] {
    return campaignsData.map(campaign => this.formatCampaign(campaign));
  }
}