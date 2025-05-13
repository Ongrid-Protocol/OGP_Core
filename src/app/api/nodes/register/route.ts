import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NodeRegistrationData, SolarSetupType } from '@/lib/types';

// Path to the devices.yaml file
const DEVICES_YAML_PATH = path.join(process.cwd(), 'src', 'lib', 'devices.yaml');

/**
 * Get the device setup information based on type or ID
 */
function getDeviceSetupInfo(nodeData: NodeRegistrationData): {
  prefix: string;
  typeName: string;
  setupType: SolarSetupType;
} {
  // Determine the setup type
  let setupType: SolarSetupType = 'generator';
  
  // Try to determine from the ID first
  if (nodeData.id) {
    if (nodeData.id.startsWith('SG')) {
      setupType = 'generator';
    } else if (nodeData.id.startsWith('SC')) {
      setupType = 'consumer';
    }
  
  // If not clear from ID, try from device_type
  } else if (nodeData.device_type) {
    if (nodeData.device_type.includes('consumer')) {
      setupType = 'consumer';
    } else if (nodeData.device_type.includes('generator')) {
      setupType = 'generator';
    }
  }

  // Get prefix and type name based on setup type
  let prefix = '';
  let typeName = '';
  switch (setupType) {
    case 'generator':
      prefix = 'SG';
      typeName = 'Solar Generator';
      break;
    case 'consumer':
      prefix = 'SC';
      typeName = 'Solar Consumer';
      break;
  }
  
  return { prefix, typeName, setupType };
}

/**
 * Verify or generate a valid device ID
 */
function validateDeviceId(nodeData: NodeRegistrationData): string {
  // If the ID already follows our format, use it
  const idPattern = /^(SG|SC)\d+[A-Z]{2}\d+$/;
  if (nodeData.id && idPattern.test(nodeData.id)) {
    return nodeData.id;
  }

  const { prefix } = getDeviceSetupInfo(nodeData);
  const country = nodeData.location.country?.code || 'KE';
  
  // Get the existing devices to determine the next number
  let existingDevices: any[] = [];
  if (fs.existsSync(DEVICES_YAML_PATH)) {
    const fileContents = fs.readFileSync(DEVICES_YAML_PATH, 'utf8');
    const yamlData = yaml.load(fileContents) as { nodes?: any[] } || { nodes: [] };
    existingDevices = yamlData.nodes || [];
  }
  
  // Find the highest number for this prefix and country
  const relevantDevices = existingDevices.filter(device => 
    device.id && device.id.startsWith(prefix) && device.location.country === country
  );
  
  let highestNumber = 0;
  relevantDevices.forEach(device => {
    const match = device.id.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > highestNumber) {
        highestNumber = num;
      }
    }
  });
  
  const nextNumber = (highestNumber + 1).toString().padStart(2, '0');
  return `${prefix}10${nextNumber}${country}${nextNumber}`;
}

/**
 * Generate a device name based on type and number
 */
function generateDeviceName(nodeData: NodeRegistrationData, deviceId: string): string {
  // If the name is already provided, use it
  if (nodeData.node_name && nodeData.node_name.trim() !== '') {
    return nodeData.node_name;
  }
  
  const { typeName } = getDeviceSetupInfo(nodeData);
  
  // Extract the number from the end of the ID
  const match = deviceId.match(/\d+$/);
  if (match) {
    const numberStr = match[0];
    return `${typeName} ${numberStr.padStart(3, '0')}`;
  }
  
  // Fallback: use a timestamp if we can't extract the number
  return `${typeName} ${Date.now().toString().slice(-3)}`;
}

/**
 * Fetch node information from ICP registry based on peer ID
 */
async function fetchNodeInfoFromICP(peerId: string) {
  // This is just a mock function - in production, this would query the ICP registry
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response
  return {
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    location: {
      latitude: (Math.random() * 180) - 90, // -90 to 90
      longitude: (Math.random() * 360) - 180, // -180 to 180
      country: "Auto-detected",
      region: "Auto-detected",
    }
  };
}

/**
 * Update devices.yaml with new node information
 */
async function updateDevicesYaml(
  nodeId: string,
  nodeName: string,
  nodeData: NodeRegistrationData,
  icpData: any
) {
  try {
    // Read existing YAML file
    let devicesYaml: any = {};
    
    if (fs.existsSync(DEVICES_YAML_PATH)) {
      const fileContents = fs.readFileSync(DEVICES_YAML_PATH, 'utf8');
      devicesYaml = yaml.load(fileContents) as { nodes?: any[] } || { nodes: [] };
    } else {
      devicesYaml = { nodes: [] };
    }
    
    // Check if node already exists
    const existingNodeIndex = devicesYaml.nodes.findIndex((node: any) => node.id === nodeId);
    
    const updatedNode = {
      id: nodeId,
      name: nodeName,
      device_type: nodeData.device_type,
      peerId: nodeData.peer_id,
      ip: icpData.ip,
      port: 8080, // Default port
      location: {
        latitude: icpData.location.latitude || nodeData.location.latitude,
        longitude: icpData.location.longitude || nodeData.location.longitude,
        country: nodeData.location.country?.code || icpData.location.country || "Unknown",
        region: nodeData.location.country?.region || icpData.location.region || "Unknown",
      },
      specifications: {
        max_wattage: nodeData.specifications.max_wattage,
        voltage_range: nodeData.specifications.voltage_range,
        frequency_range: nodeData.specifications.frequency_range,
        battery_capacity: nodeData.specifications.battery_capacity,
        phase_type: nodeData.specifications.phase_type
      },
      last_updated: new Date().toISOString(),
      owner_wallet: nodeData.wallet_address,
    };
    
    if (existingNodeIndex >= 0) {
      // Update existing node
      devicesYaml.nodes[existingNodeIndex] = {
        ...devicesYaml.nodes[existingNodeIndex],
        ...updatedNode,
      };
    } else {
      // Add new node
      devicesYaml.nodes.push(updatedNode);
    }
    
    // Write updated YAML back to file
    const yamlStr = yaml.dump(devicesYaml, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });
    
    fs.writeFileSync(DEVICES_YAML_PATH, yamlStr, 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating devices.yaml:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodeId: providedNodeId, nodeData } = body;
    
    // Validate or generate proper node ID
    const nodeId = validateDeviceId(nodeData);
    
    // Generate a device name if needed
    const nodeName = generateDeviceName(nodeData, nodeId);
    
    // 1. Fetch node info from ICP registry
    const icpData = await fetchNodeInfoFromICP(nodeData.peer_id);
    
    // 2. Update devices.yaml
    const updated = await updateDevicesYaml(nodeId, nodeName, nodeData, icpData);
    
    return NextResponse.json({ 
      success: updated, 
      nodeId,
      nodeName,
      icpData 
    });
  } catch (error) {
    console.error('Error processing node registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process node registration' },
      { status: 500 }
    );
  }
} 