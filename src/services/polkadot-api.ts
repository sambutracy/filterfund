import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { config } from '../config/env';

let api: ApiPromise | null = null;

export const initPolkadotApi = async (): Promise<ApiPromise> => {
  if (api) return api;
  
  try {
    console.log('Connecting to Polkadot node:', config.polkadotEndpoint);
    const wsProvider = new WsProvider(config.polkadotEndpoint);
    
    api = await ApiPromise.create({ 
      provider: wsProvider,
      types: {
        Filter: {
          platform: 'Vec<u8>',
          filter_type: 'Vec<u8>',
          instructions: 'Vec<u8>',
          filter_url: 'Vec<u8>'
        },
        Campaign: {
          creator: 'AccountId',
          creator_name: 'Vec<u8>',
          title: 'Vec<u8>',
          description: 'Vec<u8>',
          main_image: 'Vec<u8>',
          filter_image: 'Vec<u8>',
          category: 'Vec<u8>',
          target: 'Balance',
          amount_collected: 'Balance',
          deadline: 'u64',
          is_active: 'bool',
          filter: 'Filter'
        }
      }
    });
    
    console.log(`Connected to chain: ${(await api.rpc.system.chain()).toString()}`);
    return api;
  } catch (error) {
    console.error('Failed to connect to Polkadot node:', error);
    throw error;
  }
};

export const connectWallet = async (appName: string = 'FilterFund AR Platform') => {
  try {
    console.log('Enabling web3 extensions...');
    const extensions = await web3Enable(appName);
    
    if (extensions.length === 0) {
      throw new Error('No extension installed, or the user did not accept the authorization');
    }
    
    console.log('Getting accounts...');
    const allAccounts = await web3Accounts();
    console.log(`Found ${allAccounts.length} accounts`);
    return allAccounts;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

export const disconnectApi = async () => {
  if (api) {
    console.log('Disconnecting from Polkadot node...');
    await api.disconnect();
    api = null;
  }
};