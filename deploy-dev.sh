#!/bin/bash

# Stop any running IC replica
dfx stop

# Start a clean IC replica
dfx start --clean --background

# Generate declarations
dfx generate

# Deploy backend canisters
dfx deploy asset
dfx deploy campaign
dfx deploy user

# Create .env.local file
cat > .env.local << EOL
# Environment variables for the AR for Equality app
REACT_APP_PRIVY_APP_ID=cm7x0zd4401hgnd3c43e9kfpr 

# Canister IDs for local development
REACT_APP_ASSET_CANISTER_ID=\$(dfx canister id asset)
REACT_APP_CAMPAIGN_CANISTER_ID=\$(dfx canister id campaign)
REACT_APP_USER_CANISTER_ID=\$(dfx canister id user)
EOL

# Start React development server
echo "Canister backends deployed successfully!"
echo "To start the React development server, run:"
echo "npm start"
EOF

