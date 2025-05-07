import { initPolkadotApi } from './polkadot-api';

export const debugHelper = {
  info: (...args: any[]) => console.info(...args),
  error: (...args: any[]) => console.error(...args)
};

export const debugPolkadotConnection = async () => {
  try {
    debugHelper.info('debugPolkadotConnection', 'Testing Polkadot connection...');
    const api = await initPolkadotApi();
    
    // Check chain information
    const chain = await api.rpc.system.chain();
    const nodeName = await api.rpc.system.name();
    const nodeVersion = await api.rpc.system.version();
    
    debugHelper.info('debugPolkadotConnection', `Connected to chain: ${chain.toString()}`);
    debugHelper.info('debugPolkadotConnection', `Node name: ${nodeName.toString()}`);
    debugHelper.info('debugPolkadotConnection', `Node version: ${nodeVersion.toString()}`);
    
    // Check if our pallets exist
    const hasCampaignPallet = api.query.campaignPallet !== undefined;
    debugHelper.info('debugPolkadotConnection', `Campaign pallet available: ${hasCampaignPallet}`);
    
    // Check methods available
    if (hasCampaignPallet) {
      debugHelper.info('debugPolkadotConnection', 'Available methods:', Object.keys(api.query.campaignPallet));
    }
    
    return {
      success: true,
      chain: chain.toString(),
      nodeName: nodeName.toString(),
      nodeVersion: nodeVersion.toString(),
      hasCampaignPallet
    };
  } catch (error: unknown) {
    debugHelper.error('debugPolkadotConnection', 'Polkadot connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const testCampaignCreation = async () => {
  try {
    debugHelper.info('testCampaignCreation', 'Testing campaign creation...');
    const api = await initPolkadotApi();
    
    // Get current campaign count
    const campaignCount = await api.query.campaignPallet.campaignCount();
    debugHelper.info('testCampaignCreation', `Current campaign count: ${campaignCount.toString()}`);
    
    return {
      success: true,
      campaignCount: campaignCount.toString()
    };
  } catch (error: unknown) {
    debugHelper.error('testCampaignCreation', 'Campaign creation test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};