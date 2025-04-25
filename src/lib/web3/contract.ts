import { ethers } from 'ethers';
import { Web3Config } from '../types';

// Mock ABI for node registration - would be replaced with actual ABI
const nodeRegistryABI = [
  "function registerNode(string name, string peerId, uint16 port, string lat, string lng) external returns (string)",
  "function approveNode(string nodeId) external",
  "function getNode(string nodeId) external view returns (tuple(string id, string name, string peerId, uint16 port, string lat, string lng, address owner, bool approved, uint lastSeen))",
  "function getAllNodes() external view returns (tuple(string id, string name, string peerId, uint16 port, string lat, string lng, address owner, bool approved, uint lastSeen)[])",
  "function updateNodeStatus(string nodeId, uint lastSeen) external",
  "event NodeRegistered(string indexed nodeId, address owner, string name)"
];

// Default config - should be replaced by environment variables in production
const defaultConfig: Web3Config = {
  chainId: 1, // Ethereum mainnet
  contractAddress: '0x0000000000000000000000000000000000000000', // Replace with actual contract
  rpcUrl: 'https://ethereum.publicnode.com',
};

// Create provider based on config
export const getProvider = (config: Web3Config = defaultConfig) => {
  return new ethers.providers.JsonRpcProvider(config.rpcUrl);
};

// Get contract instance
export const getNodeRegistryContract = (
  address = defaultConfig.contractAddress,
  provider = getProvider()
) => {
  return new ethers.Contract(address, nodeRegistryABI, provider);
};

// Get signer for contract transactions (used by admin)
export const getContractWithSigner = (
  privateKey: string,
  address = defaultConfig.contractAddress,
  provider = getProvider()
) => {
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(address, nodeRegistryABI, wallet);
};

// Register a node
export const registerNode = async (
  name: string,
  peerId: string,
  port: number,
  lat: string,
  lng: string,
  privateKey: string
) => {
  try {
    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(defaultConfig.contractAddress, nodeRegistryABI, wallet);
    
    const tx = await contract.registerNode(name, peerId, port, lat, lng);
    const receipt = await tx.wait();
    
    // Find the NodeRegistered event
    const event = receipt.events?.find((e: ethers.Event) => e.event === 'NodeRegistered');
    const nodeId = event?.args?.nodeId;
    
    return { success: true, nodeId };
  } catch (error) {
    console.error('Error registering node:', error);
    return { success: false, error };
  }
};

// Admin approve node
export const approveNode = async (
  nodeId: string,
  adminPrivateKey: string
) => {
  try {
    const contract = getContractWithSigner(adminPrivateKey);
    const tx = await contract.approveNode(nodeId);
    await tx.wait();
    return { success: true };
  } catch (error) {
    console.error('Error approving node:', error);
    return { success: false, error };
  }
};

// Get all nodes
export const getAllNodes = async () => {
  try {
    const contract = getNodeRegistryContract();
    const nodes = await contract.getAllNodes();
    return { success: true, nodes };
  } catch (error) {
    console.error('Error getting nodes:', error);
    return { success: false, error, nodes: [] };
  }
};

// Update node status (heartbeat)
export const updateNodeStatus = async (
  nodeId: string,
  privateKey: string
) => {
  try {
    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(defaultConfig.contractAddress, nodeRegistryABI, wallet);
    
    const tx = await contract.updateNodeStatus(nodeId, Math.floor(Date.now() / 1000));
    await tx.wait();
    
    return { success: true };
  } catch (error) {
    console.error('Error updating node status:', error);
    return { success: false, error };
  }
}; 