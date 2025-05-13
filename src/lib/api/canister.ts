/**
 * Helper functions for interacting with ICP canisters via the OTP service
 */
import { NodeRegistrationData } from '../types';

const OTP_SERVICE_URL = 'http://localhost:3002';

/**
 * Generates an OTP code by calling the local OTP service
 * @param peerId - The peer ID of the node
 * @returns Promise containing the OTP code and its expiry time
 */
export async function generateOtpCode(peerId: string): Promise<{ otp: string, expiryTime?: number }> {
  try {
    console.log(`Calling OTP service to generate OTP for peer ID: ${peerId}`);
    console.log(`Sending GET request to ${OTP_SERVICE_URL}/api/otp?peerId=${encodeURIComponent(peerId)}`);
    
    try {
      // Make the API call to the OTP service
      const response = await fetch(`${OTP_SERVICE_URL}/api/otp?peerId=${encodeURIComponent(peerId)}`);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Check if the request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to generate OTP. Status: ${response.status}. Error: ${errorText}`);
        throw new Error(`Failed to generate OTP. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("OTP service response:", data);
      
      if (data && data.otp) {
        return { 
          otp: data.otp,
          expiryTime: data.expiryTime 
        };
      }
      
      // If we can't find the OTP in the response, throw an error
      throw new Error("Invalid OTP response format from service");
    } catch (fetchError) {
      console.error("Fetch error during OTP generation:", fetchError);
      
      // Check if it's a CORS error or network issue
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        console.error("Network or CORS error when connecting to OTP service. Make sure the service is running and accessible.");
        throw new Error("Could not connect to OTP service. Please check if the service is running.");
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Error calling OTP service for OTP generation:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Associates node details with an OTP using the local OTP service
 * @param otp - The OTP to associate details with
 * @param nodeData - The node registration data
 * @returns Promise containing success status
 */
export async function associateNodeDetailsWithOtp(otp: string, nodeData: NodeRegistrationData): Promise<boolean> {
  try {
    console.log(`Associating node details with OTP: ${otp} via OTP service`);
    console.log("Node data being sent:", JSON.stringify(nodeData, null, 2));
    
    // Format request data for the OTP service - use the FLAT structure required by the backend
    const requestData = {
      otp: otp,
      id: nodeData.id,
      node_name: nodeData.node_name,
      device_type: nodeData.device_type,
      contract_address: '0x0000000000000000000000000000000000000000', // Default contract address
      wallet_address: nodeData.wallet_address,
      latitude: nodeData.location.latitude,
      longitude: nodeData.location.longitude,
      altitude: nodeData.location.altitude || 0,
      accuracy: nodeData.location.accuracy || 5,
      satellites: nodeData.location.satellites || 8,
      timestamp: nodeData.location.timestamp,
      country_code: nodeData.location.country.code,
      country_name: nodeData.location.country.name,
      country_region: nodeData.location.country.region,
      max_wattage: nodeData.specifications.max_wattage,
      voltage_range: nodeData.specifications.voltage_range,
      frequency_range: nodeData.specifications.frequency_range,
      battery_capacity: nodeData.specifications.battery_capacity,
      phase_type: nodeData.specifications.phase_type
    };
    
    console.log("Formatted request data:", JSON.stringify(requestData, null, 2));
    
    // Make the API call to associate details with OTP
    console.log(`Sending POST request to ${OTP_SERVICE_URL}/api/associate-details`);
    
    try {
      const response = await fetch(`${OTP_SERVICE_URL}/api/associate-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify(requestData)
    });
    
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to associate details. Status: ${response.status}. Error: ${errorText}`);
        return false;
      }
      
      // Parse and check the response
      const responseData = await response.json();
      console.log("Association response:", responseData);
      
      return responseData.success === true;
    } catch (fetchError) {
      console.error("Fetch error during association:", fetchError);
      
      // Check if it's a CORS error or network issue
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        console.error("Network or CORS error when connecting to OTP service. Make sure the service is running and accessible.");
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Error associating node details with OTP:", error);
    return false;
  }
}

/**
 * Verifies if a node is registered with the given OTP and peer ID using the local OTP service
 * @param otp - The OTP used during registration
 * @param peerId - The peer ID of the node
 * @returns Promise indicating whether the node is registered
 */
export async function verifyNodeRegistration(otp: string, peerId: string): Promise<boolean> {
  try {
    console.log(`Verifying node registration for OTP: ${otp} and peer ID: ${peerId}`);
    console.log(`Sending GET request to ${OTP_SERVICE_URL}/api/verify-status?otp=${encodeURIComponent(otp)}&peerId=${encodeURIComponent(peerId)}`);
    
    try {
      // Make the API call to check if the node is registered
      const response = await fetch(
        `${OTP_SERVICE_URL}/api/verify-status?otp=${encodeURIComponent(otp)}&peerId=${encodeURIComponent(peerId)}`
      );
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to verify registration. Status: ${response.status}. Error: ${errorText}`);
        return false;
      }
      
      // Parse and check the response
      const responseData = await response.json();
      console.log("Verification response:", responseData);
      
      return responseData.registered === true;
    } catch (fetchError) {
      console.error("Fetch error during verification:", fetchError);
      
      // Check if it's a CORS error or network issue
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        console.error("Network or CORS error when connecting to OTP service. Make sure the service is running and accessible.");
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Error verifying node registration:", error);
    return false;
  }
}

/**
 * Checks if the OTP service is running and accessible
 * @returns Promise with boolean indicating if service is available
 */
export async function checkOtpServiceAvailability(): Promise<boolean> {
  try {
    console.log("Checking OTP service availability...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      const response = await fetch(`${OTP_SERVICE_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log("OTP service is running and accessible");
        return true;
      }
      
      console.warn(`OTP service returned status: ${response.status}`);
      return false;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error connecting to OTP service:", error);
      return false;
    }
  } catch (error) {
    console.error("Error checking OTP service:", error);
    return false;
  }
} 