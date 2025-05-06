/**
 * Helper functions for interacting with ICP canisters
 */

/**
 * Generates an OTP code by calling a locally hosted ICP canister
 * @param peerId - The peer ID of the node
 * @returns Promise containing the OTP code 
 */
export async function generateOtpCode(peerId: string): Promise<string> {
  try {
    // Get current timestamp in milliseconds
    const timestamp = Date.now().toString();
    
    // Call the bootstrap_node_backend canister's generate_otp function
    const canisterId = process.env.BOOTSTRAP_NODE_CANISTER_ID || "rrkah-fqaaa-aaaaa-aaaaq-cai"; // Default local canister ID
    const canisterUrl = `http://127.0.0.1:4943/api/v2/canister/${canisterId}/call`;
    
    console.log(`Calling bootstrap_node canister to generate OTP for peer ID: ${peerId}`);
    
    // Make the API call to the canister
    const response = await fetch(canisterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method_name: "generate_otp",
        arg: JSON.stringify({ peer_id: peerId })
      })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      // If the canister is unavailable, generate a mock OTP for demo purposes
      console.warn("Canister call failed, generating mock OTP");
      return generateMockOtp(peerId, timestamp);
    }
    
    const data = await response.json();
    return data.otp;
  } catch (error) {
    console.error("Error calling ICP canister:", error);
    // Generate a mock OTP if the canister call fails
    return generateMockOtp(peerId, Date.now().toString());
  }
}

/**
 * Generates a mock OTP for demonstration purposes
 * This is only used if the actual canister call fails
 */
function generateMockOtp(peerId: string, timestamp: string): string {
  // Create a deterministic but pseudo-random OTP based on peer ID and timestamp
  const combined = peerId + timestamp;
  let hash = 0;
  
  // Simple string hash function
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate a 6-digit OTP
  const otpNum = Math.abs(hash) % 1000000;
  return otpNum.toString().padStart(6, '0');
} 