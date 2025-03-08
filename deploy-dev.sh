#!/bin/bash

echo "Starting deployment for FilterFund development environment..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "dfx could not be found. Please install the Internet Computer SDK first."
    echo "Visit https://internetcomputer.org/docs/current/developer-docs/setup/install"
    exit 1
fi

# Stop any running IC replica
echo "Stopping any running Internet Computer replica..."
dfx stop

# Start a clean IC replica
echo "Starting clean Internet Computer replica..."
dfx start --clean --background

# Wait for the replica to start
echo "Waiting for replica to start..."
sleep 5

# Generate declarations
echo "Generating declarations..."
dfx generate

# Deploy backend canisters
echo "Deploying backend canisters..."
dfx deploy asset
dfx deploy user
dfx deploy campaign

# Get canister IDs
ASSET_CANISTER_ID=$(dfx canister id asset)
USER_CANISTER_ID=$(dfx canister id user)
CAMPAIGN_CANISTER_ID=$(dfx canister id campaign)

echo "Deployed canisters:"
echo "Asset Canister: $ASSET_CANISTER_ID"
echo "User Canister: $USER_CANISTER_ID"
echo "Campaign Canister: $CAMPAIGN_CANISTER_ID"

# Create .env.local file
echo "Creating .env.local file with canister IDs..."
cat > .env.local << EOL
# Environment variables for the FilterFund app
REACT_APP_PRIVY_APP_ID=cm7x0zd4401hgnd3c43e9kfpr

# Canister IDs for local development
REACT_APP_ASSET_CANISTER_ID=$ASSET_CANISTER_ID
REACT_APP_CAMPAIGN_CANISTER_ID=$CAMPAIGN_CANISTER_ID
REACT_APP_USER_CANISTER_ID=$USER_CANISTER_ID
REACT_APP_IC_HOST=http://localhost:8000
EOL

# Create a public/config.js file for runtime configuration
echo "Creating public/config.js for runtime configuration..."
mkdir -p public
cat > public/config.js << EOL
// Runtime configuration
window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.REACT_APP_ASSET_CANISTER_ID = "$ASSET_CANISTER_ID";
window.process.env.REACT_APP_CAMPAIGN_CANISTER_ID = "$CAMPAIGN_CANISTER_ID";
window.process.env.REACT_APP_USER_CANISTER_ID = "$USER_CANISTER_ID";
window.process.env.REACT_APP_PRIVY_APP_ID = "cm7x0zd4401hgnd3c43e9kfpr";
window.process.env.REACT_APP_IC_HOST = "http://localhost:8000";
EOL

echo "Setup complete!"
echo "To start the React development server, run: npm start"