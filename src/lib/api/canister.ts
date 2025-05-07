/**
 * Helper functions for interacting with ICP canisters
 */
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { Buffer } from "buffer";
import { CanisterNodeDetails } from '../types';

// Define the expected response types
interface OtpResponse {
  otp: string;
  expiry_time: bigint;
}

interface Node {
  principal: Principal;
  multiaddress: string;
  last_heartbeat: bigint;
}

/**
 * Generate an OTP code for the given peer ID.
 * Uses a local API service that interfaces with the bootstrap_node canister
 */
export async function generateOtpCode(peerId: string): Promise<string> {
  try {
    console.log(`Generating OTP for peer ID: ${peerId}`);
    
    // Call the local API service
    const response = await fetch(
      `http://localhost:3001/api/otp?peerId=${encodeURIComponent(peerId)}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to generate OTP");
    }
    
    console.log(`Received OTP: ${data.otp}`);
    return data.otp;
  } catch (error: any) {
    console.error("Error generating OTP:", error);
    throw new Error(`Failed to generate OTP: ${error.message}`);
  }
}

/**
 * Associate node details with a generated OTP
 * This ensures the OTP is linked to specific node information
 * Validates that all fields match the expected types for the canister
 */
export async function associateNodeDetails(
  otp: string,
  details: CanisterNodeDetails
): Promise<boolean> {
  try {
    console.log(`Associating node details with OTP: ${otp}`);
    
    // Validate types to ensure they match canister expectations
    if (
      typeof details.id !== 'string' ||
      typeof details.nodeName !== 'string' ||
      typeof details.deviceType !== 'string' ||
      typeof details.contractAddress !== 'string' ||
      typeof details.walletAddress !== 'string' ||
      typeof details.latitude !== 'number' || !isFinite(details.latitude) ||
      typeof details.longitude !== 'number' || !isFinite(details.longitude) ||
      typeof details.altitude !== 'number' || !isFinite(details.altitude) ||
      typeof details.accuracy !== 'number' || !isFinite(details.accuracy) ||
      typeof details.satellites !== 'number' || !isFinite(details.satellites) ||
      typeof details.countryCode !== 'string' ||
      typeof details.countryName !== 'string' ||
      typeof details.countryRegion !== 'string' ||
      typeof details.maxWattage !== 'number' || !isFinite(details.maxWattage) ||
      typeof details.voltageRange !== 'string' ||
      typeof details.frequencyRange !== 'number' || !isFinite(details.frequencyRange) ||
      typeof details.batteryCapacity !== 'number' || !isFinite(details.batteryCapacity) ||
      typeof details.phaseType !== 'string'
    ) {
      console.error("Invalid types in node details", details);
      throw new Error("Node details contain invalid types");
    }
    
    // Validate latitude/longitude ranges
    if (details.latitude < -90 || details.latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    
    if (details.longitude < -180 || details.longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
    
    // Convert integer latitude/longitude to explicit floats if necessary
    const formattedDetails = {
      ...details,
      // Add decimal point to integer values to make them explicit floats
      latitude: Number.isInteger(details.latitude) ? parseFloat(details.latitude.toFixed(1)) : details.latitude,
      longitude: Number.isInteger(details.longitude) ? parseFloat(details.longitude.toFixed(1)) : details.longitude,
      altitude: Number.isInteger(details.altitude) ? parseFloat(details.altitude.toFixed(1)) : details.altitude,
      accuracy: Number.isInteger(details.accuracy) ? parseFloat(details.accuracy.toFixed(1)) : details.accuracy
    };
    
    // Format the request according to the canister's expected Candid format
    const request = {
      otp,
      id: formattedDetails.id,
      node_name: formattedDetails.nodeName,
      device_type: formattedDetails.deviceType,
      contract_address: formattedDetails.contractAddress,
      wallet_address: formattedDetails.walletAddress,
      latitude: formattedDetails.latitude,
      longitude: formattedDetails.longitude, 
      altitude: formattedDetails.altitude,
      accuracy: formattedDetails.accuracy,
      satellites: formattedDetails.satellites,
      timestamp: [formattedDetails.timestamp], // Wrap in array for opt nat64
      country_code: formattedDetails.countryCode,
      country_name: formattedDetails.countryName,
      country_region: formattedDetails.countryRegion,
      max_wattage: formattedDetails.maxWattage.toString(),
      voltage_range: formattedDetails.voltageRange,
      frequency_range: formattedDetails.frequencyRange.toString(),
      battery_capacity: formattedDetails.batteryCapacity.toString(),
      phase_type: formattedDetails.phaseType
    };
    console.log(`Associating node details with OTP:`, request);
    
    // Call the local API service to associate details
    const response = await fetch(
      `http://localhost:3001/api/associate-details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Associated node details with OTP: ${JSON.stringify(request)}`);
    return data.success;
  } catch (error: any) {
    console.error("Error associating node details:", error);
    throw new Error(`Failed to associate node details: ${error.message}`);
  }
}

/**
 * Verify the registration status of a node using its OTP
 * This checks if the OTP has been used successfully and the node is fully registered
 */
export async function verifyRegistrationStatus(otp: string, peerId?: string): Promise<boolean> {
  try {
    console.log(`Checking registration status for OTP: ${otp}`);
    
    // Build the URL with the appropriate parameters
    let url = `http://localhost:3001/api/verify-status?otp=${encodeURIComponent(otp)}`;
    if (peerId) {
      url += `&peerId=${encodeURIComponent(peerId)}`;
    }
    
    // Call the local API service to check if OTP has been used and node is registered
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data.registered;
  } catch (error: any) {
    console.error("Error verifying registration status:", error);
    throw new Error(`Failed to verify registration status: ${error.message}`);
  }
}

/**
 * Checks if a node with the given peer ID is registered with the canister
 * @param peerId - The peer ID to check
 * @returns Promise<boolean> - Whether the node is registered
 */
export async function isNodeRegistered(peerId: string): Promise<boolean> {
  try {
    const canisterId = process.env.BOOTSTRAP_NODE_CANISTER_ID || "bkyz2-fmaaa-aaaaa-qaaaq-cai";
    const canisterUrl = `http://127.0.0.1:4943/api/v2/canister/${canisterId}/call`;
    
    console.log(`Checking if node with peer ID ${peerId} is registered`);
    
    // Make a query call to get_nodes
    const response = await fetch(canisterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cbor'
      },
      body: JSON.stringify({
        request_type: "call",
        canister_id: canisterId,
        method_name: "get_nodes",
        arg: [],
        sender: Principal.anonymous().toText()
      })
    });
    
    if (!response.ok) {
      console.warn("Failed to check node registration status:", response.status);
      return false;
    }
    
    const responseData = await response.json();
    
    if (!responseData.reply || !responseData.reply.arg) {
      console.warn("Invalid response format when checking node registration");
      return false;
    }
    
    // Decode the response bytes - it will be an array of Nodes
    const resultBytes = new Uint8Array(responseData.reply.arg);
    const nodeType = IDL.Record({
      principal: IDL.Principal,
      multiaddress: IDL.Text,
      last_heartbeat: IDL.Nat64
    });
    
    const registeredNodes = IDL.decode([IDL.Vec(nodeType)], resultBytes.buffer)[0] as unknown as Node[];
    
    // Check if any node's multiaddress contains our peer ID
    const isRegistered = registeredNodes.some(node => 
      node.multiaddress.includes(peerId)
    );
    
    console.log(`Node registration status for ${peerId}: ${isRegistered ? "Registered" : "Not registered"}`);
    
    return isRegistered;
  } catch (error) {
    console.error("Error checking node registration status:", error);
    return false;
  }
}

/**
 * Gets the count of registered nodes
 * @returns Promise<number> - The count of registered nodes
 */
export async function getRegisteredNodeCount(): Promise<number> {
  try {
    const canisterId = process.env.BOOTSTRAP_NODE_CANISTER_ID || "bkyz2-fmaaa-aaaaa-qaaaq-cai";
    const canisterUrl = `http://127.0.0.1:4943/api/v2/canister/${canisterId}/call`;
    
    // Make a query call to get_nodes
    const response = await fetch(canisterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cbor'
      },
      body: JSON.stringify({
        request_type: "call",
        canister_id: canisterId,
        method_name: "get_nodes",
        arg: [],
        sender: Principal.anonymous().toText()
      })
    });
    
    if (!response.ok) {
      console.warn("Failed to get registered node count:", response.status);
      return 0;
    }
    
    const responseData = await response.json();
    
    if (!responseData.reply || !responseData.reply.arg) {
      console.warn("Invalid response format when getting node count");
      return 0;
    }
    
    // Decode the response bytes - it will be an array of Nodes
    const resultBytes = new Uint8Array(responseData.reply.arg);
    const nodeType = IDL.Record({
      principal: IDL.Principal,
      multiaddress: IDL.Text,
      last_heartbeat: IDL.Nat64
    });
    
    const registeredNodes = IDL.decode([IDL.Vec(nodeType)], resultBytes.buffer)[0] as unknown as Node[];
    return registeredNodes.length;
  } catch (error) {
    console.error("Error getting registered node count:", error);
    return 0;
  }
}

/**
 * Fetches the devices.yaml content from the canister
 * @returns Promise<string> - The devices.yaml content
 */
export async function getDevicesYaml(): Promise<string> {
  try {
    console.log("Fetching devices.yaml from canister via middleware");
    
    // Call the local API service to get devices.yaml
    const response = await fetch(
      `http://localhost:3001/api/devices-yaml`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.content) {
      throw new Error(data.error || "Failed to fetch devices.yaml content");
    }
    
    return data.content;
  } catch (error: any) {
    console.error("Error fetching devices.yaml:", error);
    throw new Error(`Failed to fetch devices.yaml: ${error.message}`);
  }
}

// Export other API functions that may be used elsewhere
export {
  // Add any other exports here
};
