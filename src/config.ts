// src/config.ts
export const config = {
  polkadotConfig: {
    development: {
      endpoint: "wss://shibuya-rpc.dwellir.com",
      contractAddress: "YjRXP44Yc5AhuRgKo4KKWb3grvxfDsufiEpXgACrrNZDyrL"
    },
    production: {
      endpoint: process.env.REACT_APP_SHIBUYA_ENDPOINT || "wss://shibuya-rpc.dwellir.com",
      contractAddress: process.env.REACT_APP_SHIBUYA_CONTRACT_ADDRESS || "YjRXP44Yc5AhuRgKo4KKWb3grvxfDsufiEpXgACrrNZDyrL"
    }
  },
  isProduction: process.env.NODE_ENV === 'production'
};