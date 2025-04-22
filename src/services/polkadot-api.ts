import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { config } from '../config/env';

let api: ApiPromise | null = null;

export const initPolkadotApi = async (): Promise<ApiPromise> => {
  if (api) return api;
  
  const wsProvider = new WsProvider(config.polkadotEndpoint);
  api = await ApiPromise.create({ provider: wsProvider });
  
  console.log(`Connected to chain: ${(await api.rpc.system.chain()).toString()}`);
  return api;
};

export const connectWallet = async (appName: string = 'FilterFund AR Platform') => {
  const extensions = await web3Enable(appName);
  
  if (extensions.length === 0) {
    throw new Error('No extension installed, or the user did not accept the authorization');
  }
  
  const allAccounts = await web3Accounts();
  return allAccounts;
};

export const disconnectApi = async () => {
  if (api) {
    await api.disconnect();
    api = null;
  }
};