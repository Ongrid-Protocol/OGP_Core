import React, { useState, useEffect } from 'react';
import { generateOtpCode, isNodeRegistered, getRegisteredNodeCount } from '../lib/api/canister';

type NodeRegistrationProps = {
  peerId: string;
  onRegistrationComplete: (success: boolean) => void;
};

export const NodeRegistration: React.FC<NodeRegistrationProps> = ({ 
  peerId, 
  onRegistrationComplete 
}) => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending');
  const [registeredNodes, setRegisteredNodes] = useState<number>(0);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch OTP code directly from the canister when component mounts
  useEffect(() => {
    const fetchOtpCode = async () => {
      if (!peerId) {
        setError('Peer ID is required to generate OTP');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Requesting OTP code from canister for peer ID:", peerId);
        const code = await generateOtpCode(peerId);
        console.log("Received official OTP from canister:", code);
        setOtpCode(code);
        setError(null);
      } catch (err) {
        setError('Failed to generate OTP code from canister. Please try again or use the script to get the OTP.');
        console.error('Error generating OTP:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOtpCode();
  }, [peerId]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  // Copy OTP to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(otpCode)
      .then(() => {
        alert('OTP copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Show script command for getting OTP directly
  const showScriptCommand = () => {
    const command = `./scripts/get-otp.sh "${peerId}"`;
    alert(`To get the exact same OTP from the script, run:\n\n${command}`);
  };

  // Monitor registration status
  const checkRegistrationStatus = async () => {
    setRegistrationStatus('verifying');
    
    try {
      // First check how many nodes are registered
      const nodeCount = await getRegisteredNodeCount();
      setRegisteredNodes(nodeCount);
      
      // Check if our node is registered
      const registered = await isNodeRegistered(peerId);
      
      if (registered) {
        setRegistrationStatus('success');
        onRegistrationComplete(true);
        
        // If registered, clear the interval
        if (checkInterval) {
          clearInterval(checkInterval);
          setCheckInterval(null);
        }
      } else {
        // If not registered yet, continue polling
        if (!checkInterval) {
          // Set up polling every 10 seconds
          const interval = setInterval(async () => {
            const stillRegistered = await isNodeRegistered(peerId);
            const currentCount = await getRegisteredNodeCount();
            setRegisteredNodes(currentCount);
            
            if (stillRegistered) {
              setRegistrationStatus('success');
              onRegistrationComplete(true);
              clearInterval(interval);
              setCheckInterval(null);
            }
          }, 10000);
          
          setCheckInterval(interval);
        }
      }
    } catch (err) {
      console.error('Error checking registration status:', err);
      setRegistrationStatus('failed');
      onRegistrationComplete(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Node Registration</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Fetching OTP from canister...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 mb-4">
          {error}
          <button
            onClick={() => showScriptCommand()}
            className="mt-2 text-blue-500 underline"
          >
            Use script instead
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Your Peer ID:</p>
            <p className="bg-gray-100 p-2 rounded break-all">{peerId}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Canister-Generated OTP:</p>
            <div className="flex">
              <p className="bg-blue-50 p-2 rounded font-mono text-xl flex-grow text-center">{otpCode}</p>
              <button 
                onClick={copyToClipboard}
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This OTP was generated directly by the canister. Use it when registering your node.
            </p>
            <button
              onClick={showScriptCommand}
              className="text-xs text-blue-500 underline mt-1"
            >
              Show script command
            </button>
          </div>
          
          <div className="mb-4 text-sm text-gray-600">
            <p>Registered Nodes: <span className="font-semibold">{registeredNodes}</span></p>
            {registeredNodes < 5 && (
              <p className="text-amber-600">At least 5 nodes need to be registered before verification starts.</p>
            )}
          </div>
          
          {registrationStatus === 'pending' && (
            <button
              onClick={checkRegistrationStatus}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Check Registration Status
            </button>
          )}
          
          {registrationStatus === 'verifying' && (
            <div className="text-center py-2">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
              <span>Verifying registration...</span>
              <p className="text-xs mt-1 text-gray-500">
                {checkInterval ? 'Polling every 10 seconds...' : ''}
              </p>
            </div>
          )}
          
          {registrationStatus === 'success' && (
            <div className="text-green-500 font-medium text-center py-2">
              ✓ Node successfully registered!
            </div>
          )}
          
          {registrationStatus === 'failed' && (
            <div>
              <div className="text-red-500 font-medium text-center py-2 mb-2">
                ✗ Registration failed. Please try again.
              </div>
              <button
                onClick={checkRegistrationStatus}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeRegistration; 