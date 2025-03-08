#!/bin/bash

# Verbose error handling
set -ex

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Stop any existing replica
dfx stop || true

# Start a new replica
dfx start --clean --background

# Wait for replica to start
sleep 5

# Create and deploy canisters
dfx canister create --all
dfx deploy

# Generate declarations
dfx generate

# Create env file with canister IDs
cat > .env.local << EOL
CANISTER_ID_CAMPAIGN=$(dfx canister id campaign)
CANISTER_ID_ASSET=$(dfx canister id asset)
CANISTER_ID_USER=$(dfx canister id user)
REACT_APP_PRIVY_APP_ID=your_privy_app_id
EOL

echo "Deployment complete!"
