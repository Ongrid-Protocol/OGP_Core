#!/bin/bash
# Script to deploy bootstrap_node canister and set up the connection

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to bootstrap_node directory
cd ../bootstrap_node || { echo -e "${RED}Error: bootstrap_node directory not found${NC}"; exit 1; }

echo -e "${YELLOW}Starting local Internet Computer replica...${NC}"
dfx start --background --clean || { echo -e "${RED}Failed to start IC replica${NC}"; exit 1; }

echo -e "${YELLOW}Deploying bootstrap_node canister...${NC}"
dfx deploy bootstrap_node_backend || { echo -e "${RED}Failed to deploy bootstrap_node_backend canister${NC}"; exit 1; }

# Get the canister ID
CANISTER_ID=$(dfx canister id bootstrap_node_backend)
echo -e "${GREEN}Bootstrap node canister deployed with ID: ${CANISTER_ID}${NC}"

# Create or update .env file for the node manager
cd ../ogp-node-manager || { echo -e "${RED}Error: ogp-node-manager directory not found${NC}"; exit 1; }

# Create .env file with the canister ID
cat > .env << EOF
BOOTSTRAP_NODE_CANISTER_ID=${CANISTER_ID}
EOF

echo -e "${GREEN}Created .env file with canister ID${NC}"
echo -e "${YELLOW}Starting node manager application...${NC}"
npm run dev

echo -e "${GREEN}Done! Access the node manager at http://localhost:3000${NC}" 