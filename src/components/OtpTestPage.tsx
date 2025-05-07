import React, { useState } from 'react';
import { generateOtpCode } from '../lib/api/canister';

const OtpTestPage: React.FC = () => {
  const [peerId, setPeerId] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Custom console logger to capture output
  const captureConsole = (message: string) => {
    setConsoleOutput(prev => [...prev, message]);
  };

  // Override console log temporarily to capture output
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const setupConsoleCapture = () => {
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      captureConsole(`[LOG] ${message}`);
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      captureConsole(`[ERROR] ${message}`);
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      captureConsole(`[WARN] ${message}`);
      originalConsoleWarn.apply(console, args);
    };
  };

  const restoreConsole = () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  };

  const handleGenerateOtp = async () => {
    if (!peerId) {
      setError('Please enter a Peer ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setOtp('');
    setConsoleOutput([]);

    try {
      setupConsoleCapture();
      const generatedOtp = await generateOtpCode(peerId);
      setOtp(generatedOtp);
    } catch (err) {
      setError(`Error generating OTP: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      restoreConsole();
      setIsLoading(false);
    }
  };

  const handleScriptInstructions = () => {
    const scriptCommand = `./scripts/get-otp.sh "${peerId}"`;
    captureConsole(`[INFO] To verify this OTP with the script, run this command:`);
    captureConsole(`[CMD] ${scriptCommand}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">OTP Generation Test</h1>
      <p className="mb-4 text-gray-700">
        This page tests the OTP generation code to ensure it matches what the script produces.
      </p>

      <div className="mb-4">
        <label htmlFor="peerId" className="block text-sm font-medium text-gray-700">
          Enter Peer ID:
        </label>
        <input
          type="text"
          id="peerId"
          value={peerId}
          onChange={(e) => setPeerId(e.target.value)}
          placeholder="12D3KooW..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={handleGenerateOtp}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isLoading ? 'Generating...' : 'Generate OTP'}
        </button>

        {otp && (
          <button
            onClick={handleScriptInstructions}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Show Script Command
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {otp && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Generated OTP:</h2>
          <div className="p-4 bg-green-100 border border-green-300 rounded-md">
            <span className="text-2xl font-mono">{otp}</span>
          </div>
        </div>
      )}

      {consoleOutput.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Debug Output:</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
            <pre className="font-mono text-sm whitespace-pre-wrap">
              {consoleOutput.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpTestPage; 