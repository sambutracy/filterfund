// src/config/debug.js
// Configuration file for debug settings across the application

// Set global debug flags based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Debug configuration object
const debugConfig = {
  // Master switch - when false, all debug features are disabled
  enableDebug: !isProduction,
  
  // Individual feature flags
  features: {
    logApiCalls: !isProduction,
    showDebugPanels: !isProduction,
    mockData: false, // We want this off even in development unless explicitly needed
    verboseLogging: !isProduction,
    profilePerformance: !isProduction && process.env.REACT_APP_PROFILE === 'true'
  },
  
  // Log level configuration
  logLevel: isProduction ? 'error' : 'debug',
  
  // Debug tools configuration
  tools: {
    consoleOverride: !isProduction,
    reduxDevTools: !isProduction,
    reactDevTools: !isProduction
  },
  
  // Helper functions
  shouldLog: (level) => {
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[debugConfig.logLevel];
  }
};

// Export a function to log debug info on demand (only in development)
export const printDebugInfo = () => {
  if (isProduction) return;
  
  console.log("========== FilterFund Debug Configuration ==========");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Debug enabled:", debugConfig.enableDebug);
  console.log("Log level:", debugConfig.logLevel);
  console.log("Feature flags:", debugConfig.features);
  console.log("=======================================================");
};

export default { printDebugInfo, debugConfig };