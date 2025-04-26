import React, { useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

const NETWORK_OPTIONS = [
  { label: "Westend (Test Network)", value: "wss://westend-rpc.polkadot.io" },
  { label: "Rococo (Test Network)", value: "wss://rococo-rpc.polkadot.io" },
  { label: "Astar (Parachain)", value: "wss://rpc.astar.network" }
];

const DebugPanel: React.FC = () => {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState(NETWORK_OPTIONS[0].value);

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('Testing connection to:', endpoint);
      
      const wsProvider = new WsProvider(endpoint);
      const api = await ApiPromise.create({ provider: wsProvider });
      
      const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
      ]);
      
      const modules = Object.keys(api.query);
      
      setDebugResult({
        success: true,
        chain: chain.toString(),
        nodeName: nodeName.toString(),
        nodeVersion: nodeVersion.toString(),
        availableModules: modules.length > 20 ? 
          [...modules.slice(0, 20), `...and ${modules.length - 20} more`] : 
          modules
      });
      
      await api.disconnect();
    } catch (error) {
      console.error('Connection test failed:', error);
      setDebugResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Polkadot Network Debug</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Network Endpoint
        </label>
        <select
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          aria-label="Network Endpoint"
        >
          {NETWORK_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {debugResult && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg overflow-auto max-h-80">
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;