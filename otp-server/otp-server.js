#!/usr/bin/env node

/**
 * Simple HTTP server that provides an API for the frontend to get OTPs
 * This bridges between the frontend and the canister by using dfx directly
 */

import { createServer } from 'http';
import { URL } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

// Default canister ID
const DEFAULT_CANISTER_ID = process.env.CANISTER_ID || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

// Helper function to run a shell command and return the output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.stdout?.toString() || error.message);
    throw error;
  }
}

// Function to get OTP using dfx command (same as get-otp.sh)
function getOtpUsingDfx(peerId, canisterId = DEFAULT_CANISTER_ID) {
  const command = `dfx canister call --network ic ${canisterId} generate_otp "(\\\"${peerId}\\\")"`;
  console.log(`Executing command: ${command}`);
  
  const output = runCommand(command);
  console.log(`Raw dfx output: ${output}`);
  
  // Extract both the OTP code and expiry time
  const otpMatch = output.match(/otp = "([^"]+)"/);
  const expiryMatch = output.match(/expiry_time = (\d+)/);
  
  if (otpMatch && otpMatch[1]) {
    const otp = otpMatch[1];
    let expiryTime = null;
    
    if (expiryMatch && expiryMatch[1]) {
      expiryTime = parseInt(expiryMatch[1], 10);
    }
    
    return {
      otp: otp,
      expiryTime: expiryTime
    };
  }
  
  throw new Error('Unable to parse OTP from output');
}

// Function to associate node details with an OTP
function associateDetailsWithOtp(otp, details, canisterId = DEFAULT_CANISTER_ID) {
  console.log(`Associating details with OTP: ${otp}`);
  
  // Add timestamp if not provided
  const timestamp = details.timestamp || Math.floor(Date.now() / 1000);
  
  // Let's use a different approach to create the Candid record
  // Since dfx is having trouble with directly using JavaScript numbers,
  // let's build up the command differently
  
  // Start with the base command and opening record bracket
  let command = `dfx canister call --network ic ${canisterId} associate_node_details_with_otp "(record { `;
  
  // Add string fields
  command += `otp = \\"${otp}\\"; `;
  command += `id = \\"${details.id || ''}\\"; `;
  command += `node_name = \\"${details.node_name || details.nodeName || ''}\\"; `;
  command += `device_type = \\"${details.device_type || details.deviceType || ''}\\"; `;
  command += `contract_address = \\"${details.contract_address || details.contractAddress || '0x0000000000000000000000000000000000000000'}\\"; `;
  command += `wallet_address = \\"${details.wallet_address || details.walletAddress || ''}\\"; `;
  
  // Add numeric fields with explicit type information
  command += `latitude = ${parseFloat(details.latitude || 0).toFixed(6) || '0.0'} : float64; `;
  command += `longitude = ${parseFloat(details.longitude || 0).toFixed(6) || '0.0'} : float64; `;
  command += `altitude = ${parseFloat(details.altitude || 0).toFixed(6) || '0.0'} : float64; `;
  command += `accuracy = ${parseFloat(details.accuracy || 5).toFixed(2) || '5.0'} : float32; `;
  command += `satellites = ${parseInt(details.satellites || 8, 10) || '8'} : nat8; `;
  command += `timestamp = opt ${timestamp}; `;
  
  // More string fields
  command += `country_code = \\"${details.country_code || details.countryCode || ''}\\"; `;
  command += `country_name = \\"${details.country_name || details.countryName || ''}\\"; `;
  command += `country_region = \\"${details.country_region || details.countryRegion || ''}\\"; `;
  command += `max_wattage = \\"${details.max_wattage || details.maxWattage || details.maxDailyWattage || ''}\\"; `;
  command += `voltage_range = \\"${details.voltage_range || details.voltageRange || ''}\\"; `;
  command += `frequency_range = \\"${details.frequency_range || details.frequencyRange || ''}\\"; `;
  command += `battery_capacity = \\"${details.battery_capacity || details.batteryCapacity || ''}\\"; `;
  command += `phase_type = \\"${details.phase_type || details.phaseType || ''}\\"; `;
  
  // Close the record
  command += `})"`;
  
  console.log(`Executing associate details command`);
  console.log(`Command: ${command}`);
  
  try {
    const output = runCommand(command);
    console.log(`Raw dfx output: ${output}`);
    
    // Check if the association was successful
    return output.includes("(true)");
  } catch (error) {
    console.error("Error handling request:", error);
    throw error;
  }
}

// Function to check if an OTP has been used (node has been registered)
function isOtpUsed(otp, canisterId = DEFAULT_CANISTER_ID) {
  const command = `dfx canister call --network ic ${canisterId} is_otp_used "(\\\"${otp}\\\")"`;
  console.log(`Executing command: ${command}`);
  
  try {
    const output = runCommand(command);
    console.log(`Raw dfx output: ${output}`);
    
    // Return true if OTP is marked as used (which means registration was successful)
    return output.includes("(true)");
  } catch (error) {
    console.error("Error checking if OTP is used:", error);
    // Return false on error instead of throwing
    return false;
  }
}

// Function to read request body for POST requests
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    req.on('error', reject);
  });
}

// Create a simple HTTP server
const server = createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle different API endpoints
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    // GET /api/health - Health check endpoint
    if (req.method === 'GET' && path === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok',
        service: 'OTP Service',
        version: '1.0.0'
      }));
      return;
    }
    
    // GET /api/otp - Generate OTP for peer ID
    if (req.method === 'GET' && path === '/api/otp') {
      const peerId = url.searchParams.get('peerId');
      
      if (!peerId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing peerId parameter' }));
        return;
      }
      
      console.log(`Generating OTP for peer ID: ${peerId}`);
      
      // Get OTP using dfx
      const otpData = getOtpUsingDfx(peerId);
      
      // Return success response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true,
        otp: otpData.otp,
        expiry_time: otpData.expiryTime,
        peer_id: peerId
      }));
      return;
    }
    
    // POST /api/associate-details - Associate node details with OTP
    if (req.method === 'POST' && path === '/api/associate-details') {
      const data = await readRequestBody(req);
      
      if (!data.otp) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing OTP in request' }));
        return;
      }
      
      console.log(`Associating details with OTP: ${data.otp}`);
      console.log(`Received data: ${JSON.stringify(data, null, 2)}`);
      
      // Normalize data to handle different field naming conventions
      const normalizedData = {
        otp: data.otp,
        id: data.id || '',
        node_name: data.node_name || data.nodeName || '',
        device_type: data.device_type || data.deviceType || '',
        contract_address: data.contract_address || data.contractAddress || '0x0000000000000000000000000000000000000000',
        wallet_address: data.wallet_address || data.walletAddress || '',
        latitude: parseFloat(data.latitude || (data.location ? data.location.latitude : 0)),
        longitude: parseFloat(data.longitude || (data.location ? data.location.longitude : 0)),
        altitude: parseFloat(data.altitude || (data.location && data.location.altitude) || 0),
        accuracy: parseFloat(data.accuracy || (data.location && data.location.accuracy) || 5),
        satellites: parseInt(data.satellites || (data.location && data.location.satellites) || 8, 10),
        timestamp: parseInt(data.timestamp || (data.location && data.location.timestamp) || Math.floor(Date.now() / 1000), 10),
        country_code: data.country_code || (data.location && data.location.country && data.location.country.code) || '',
        country_name: data.country_name || (data.location && data.location.country && data.location.country.name) || '',
        country_region: data.country_region || (data.location && data.location.country && data.location.country.region) || '',
        max_wattage: data.max_wattage || (data.specifications && data.specifications.max_wattage) || 
                    data.maxWattage || data.maxDailyWattage || '',
        voltage_range: data.voltage_range || (data.specifications && data.specifications.voltage_range) || 
                      data.voltageRange || '',
        frequency_range: data.frequency_range || (data.specifications && data.specifications.frequency_range) || 
                        data.frequencyRange || '',
        battery_capacity: data.battery_capacity || (data.specifications && data.specifications.battery_capacity) || 
                         data.batteryCapacity || '',
        phase_type: data.phase_type || (data.specifications && data.specifications.phase_type) || 
                   data.phaseType || ''
      };
      
      console.log(`Normalized data: ${JSON.stringify(normalizedData, null, 2)}`);
      
      try {
        // Associate the details with the OTP
        const success = associateDetailsWithOtp(data.otp, normalizedData);
        
        // Return response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: success,
          message: success ? 'Successfully associated node details with OTP' : 'Failed to associate node details with OTP'
        }));
      } catch (error) {
        console.error('Error associating details:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message || 'Unknown error associating details',
          details: error.stderr || error.stdout || ''
        }));
      }
      return;
    }
    
    // GET /api/verify-status - Check if node has been registered (OTP used)
    if (req.method === 'GET' && path === '/api/verify-status') {
      const otp = url.searchParams.get('otp');
      
      if (!otp) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing OTP parameter' }));
        return;
      }
      
      console.log(`Checking registration status for OTP: ${otp}`);
      
      // Check if the OTP has been used
      const registered = isOtpUsed(otp);
      
      // Return response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        registered: registered,
        message: registered ? 'OTP has been used (node registered)' : 'OTP has not been used yet'
      }));
      return;
    }
    
    // Handle 404 for unknown endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    
  } catch (error) {
    console.error('Error handling request:', error);
    
    // Return error response
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown server error',
      details: error.stderr || error.stdout || ''
    }));
  }
});

// Start the server on port 3002
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`
========================================================
    OTP Service running at http://localhost:${PORT}
========================================================

Available endpoints:

1. Generate OTP:
   GET http://localhost:${PORT}/api/otp?peerId=YOUR_PEER_ID
   
   Response format:
   {
     "success": true,
     "otp": "123456",
     "expiry_time": 1747140079,
     "peer_id": "YOUR_PEER_ID"
   }

2. Associate Node Details with OTP:
   POST http://localhost:${PORT}/api/associate-details
   
   Request format (send as JSON in request body):
   {
     "otp": "123456",
     "id": "SG10NodeXYZ",
     "node_name": "My Solar Node",
     "device_type": "Solar Generator",
     "wallet_address": "0x123...",
     "location": {
       "latitude": 37.5665,
       "longitude": 126.978,
       "altitude": 0,
       "accuracy": 5,
       "satellites": 8,
       "timestamp": 1684795872,
       "country": {
         "code": "KR",
         "name": "South Korea",
         "region": "Asia"
       }
     },
     "specifications": {
       "max_wattage": "1200",
       "voltage_range": "220-240",
       "frequency_range": "50",
       "battery_capacity": "12000",
       "phase_type": "single"
     }
   }
   
   Response format:
   {
     "success": true,
     "message": "Successfully associated node details with OTP"
   }

3. Verify Registration Status:
   GET http://localhost:${PORT}/api/verify-status?otp=123456
   
   Response format:
   {
     "registered": true,
     "message": "OTP has been used (node registered)"
   }

Update your frontend to use these endpoints for the complete registration flow.
`);
}); 