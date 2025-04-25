import { NodeRegistrationData } from '@/lib/types';

/**
 * Process node registration by making API call to server endpoint
 * This is client-safe as it uses fetch instead of direct file access
 */
export async function processNodeRegistration(nodeId: string, nodeData: NodeRegistrationData) {
  try {
    const response = await fetch('/api/nodes/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodeId,
        nodeData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error processing node registration:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
} 