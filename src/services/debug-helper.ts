import { initPolkadotApi } from './polkadot-api';

export const debugPolkadotConnection = async () => {
  try {
    console.log('Testing Polkadot connection...');
    const api = await initPolkadotApi();
    
    // Check chain information
    const chain = await api.rpc.system.chain();
    const nodeName = await api.rpc.system.name();
    const nodeVersion = await api.rpc.system.version();
    
    console.log(`Connected to chain: ${chain.toString()}`);
    console.log(`Node name: ${nodeName.toString()}`);
    console.log(`Node version: ${nodeVersion.toString()}`);
    
    // Check if our pallets exist
    const hasCampaignPallet = api.query.campaignPallet !== undefined;
    console.log(`Campaign pallet available: ${hasCampaignPallet}`);
    
    // Check methods available
    if (hasCampaignPallet) {
      console.log('Available methods:', Object.keys(api.query.campaignPallet));
    }
    
    return {
      success: true,
      chain: chain.toString(),
      nodeName: nodeName.toString(),
      nodeVersion: nodeVersion.toString(),
      hasCampaignPallet
    };
  } catch (error: unknown) {
    console.error('Polkadot connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const testCampaignCreation = async () => {
  try {
    console.log('Testing campaign creation...');
    const api = await initPolkadotApi();
    
    // Get current campaign count
    const campaignCount = await api.query.campaignPallet.campaignCount();
    console.log(`Current campaign count: ${campaignCount.toString()}`);
    
    return {
      success: true,
      campaignCount: campaignCount.toString()
    };
  } catch (error: unknown) {
    console.error('Campaign creation test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};