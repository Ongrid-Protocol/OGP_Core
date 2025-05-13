'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiMapPin, FiServer, FiSettings, FiArrowRight, FiClock, FiInfo, FiGlobe, FiCpu, FiUser, FiWifi, FiCheckCircle, FiCopy } from 'react-icons/fi';
import Link from 'next/link';
import { countries, deviceCounters, locationCounters } from '@/lib/api/mockData';
import { NodeRegistrationData, SolarSetupType } from '@/lib/types';
import { generateNodeName, generateDeviceId } from '@/lib/utils/nameGenerator';
import { generateOtpCode, associateNodeDetailsWithOtp, verifyNodeRegistration, checkOtpServiceAvailability } from '@/lib/api/canister';

type DeviceType = 'Solar Generator' | 'Solar Consumer';

// Mock function to simulate node registration
async function registerNode(nodeData: NodeRegistrationData): Promise<{ success: boolean }> {
  // In a real app, this would send data to your backend
  console.log('Registering node with data:', nodeData);
  
  // Basic validation to ensure required fields exist
  if (!nodeData.id || !nodeData.peer_id || !nodeData.node_name || 
      !nodeData.location || !nodeData.specifications) {
    console.error('Missing required fields');
    return { success: false };
  }
  
  // Ensure location has all required properties
  const location = nodeData.location;
  if (!location.latitude || !location.longitude || !location.country) {
    console.error('Missing location fields');
    return { success: false };
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return { success: true };
}

export default function RegisterNodePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [deviceSetupType, setDeviceSetupType] = useState<SolarSetupType>('generator');
  const [nodeName, setNodeName] = useState<string>('');
  const [manualNameEntry, setManualNameEntry] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [devMode, setDevMode] = useState(false);
  
  // Check OTP service availability on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const isAvailable = await checkOtpServiceAvailability();
        setServiceStatus(isAvailable ? 'available' : 'unavailable');
      } catch (error) {
        console.error("Error checking service status:", error);
        setServiceStatus('unavailable');
      }
    };
    
    checkStatus();
  }, []);
  
  // Initial form data
  const [formData, setFormData] = useState<Partial<NodeRegistrationData>>({
    id: '',
    peer_id: '',
    node_name: '',
    node_creation_number: Math.floor(Date.now() / 1000), // Current timestamp in seconds
    device_type: 'Solar Generator',
    wallet_address: '',
    location: {
      latitude: 37.5665,
      longitude: 126.978,
      altitude: 0,
      accuracy: 5,
      satellites: 8,
      timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
      country: {
        code: 'KR',
        name: 'South Korea',
        region: 'Asia'
      }
    },
    specifications: {
      max_wattage: '1200',
      voltage_range: '220-240',
      frequency_range: '50',
      battery_capacity: '12000',
      phase_type: 'single'
    }
  });

  // Generate node name when page loads
  useEffect(() => {
    if (!manualNameEntry) {
      const generatedName = generateNodeName();
      setNodeName(generatedName);
      setFormData(prev => ({
        ...prev,
        node_name: generatedName
      }));
    }
  }, [manualNameEntry]);

  // Update device ID and type when device setup type or country changes
  useEffect(() => {
    if (formData.location?.country?.code) {
      // Get device counter for this type and country
      const deviceCount = deviceCounters[deviceSetupType][formData.location.country.code] + 1;
      const locationCount = locationCounters[formData.location.country.code] || 1;
      
      // Create device type string
      let deviceType: DeviceType;
      switch (deviceSetupType) {
        case 'generator':
          deviceType = 'Solar Generator';
          break;
        case 'consumer':
          deviceType = 'Solar Consumer';
          break;
        default:
          deviceType = 'Solar Generator';
      }
      
      // Generate device ID
      const id = generateDeviceId(
        deviceSetupType,
        formData.location.country.code,
        deviceCount,
        locationCount
      );
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        id,
        device_type: deviceType,
        node_creation_number: deviceCount
      }));
    }
  }, [deviceSetupType, formData.location?.country?.code]);
  
  // Handle country selection and update form
  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location!,
          country: {
            code: country.code,
            name: country.name,
            region: country.region
          }
        }
      }));
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'deviceSetupType') {
      setDeviceSetupType(value as SolarSetupType);
    } else if (name === 'latitude' || name === 'longitude' || name === 'altitude' || name === 'accuracy' || name === 'satellites') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location!,
          [name]: name === 'satellites' ? parseInt(value) : parseFloat(value) || 0
        }
      }));
    } else if (name === 'countryCode') {
      handleCountryChange(value);
    } else if (name === 'node_name') {
      setManualNameEntry(true);
      setNodeName(value);
      setFormData(prev => ({
        ...prev,
        node_name: value
      }));
    } else if (name === 'max_wattage' || name === 'voltage_range' || name === 'frequency_range' || 
               name === 'battery_capacity' || name === 'phase_type') {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications!,
          [name]: value
        }
      }));
    } else {
      // For other fields, update directly in the form data
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Generate a new random node name
  const generateNewName = () => {
    const generatedName = generateNodeName();
    setManualNameEntry(false);
    setNodeName(generatedName);
    setFormData(prev => ({
      ...prev,
      node_name: generatedName
    }));
  };

  // Form validation
  const validateStep = (): boolean => {
    setError(null);
    
    if (step === 1) {
      if (!formData.peer_id) {
        setError('Please enter a Peer ID');
        return false;
      }
      
      if (!formData.node_name) {
        setError('Please enter a Node Name');
        return false;
      }
      
      // Validate peer ID format - basic validation
      if (formData.peer_id.length < 10) {
        setError('Please enter a valid Peer ID (at least 10 characters)');
        return false;
      }
    } else if (step === 2) {
      if (!formData.location?.latitude || !formData.location?.longitude || !formData.location?.country?.code) {
        setError('Please enter complete location information');
        return false;
      }
      
      // Validate latitude/longitude ranges
      if (formData.location.latitude < -90 || formData.location.latitude > 90) {
        setError('Latitude must be between -90 and 90');
        return false;
      }
      
      if (formData.location.longitude < -180 || formData.location.longitude > 180) {
        setError('Longitude must be between -180 and 180');
        return false;
      }
    } else if (step === 3) {
      if (!formData.specifications?.max_wattage || !formData.specifications?.voltage_range ||
          !formData.specifications?.frequency_range || !formData.specifications?.battery_capacity) {
        setError('Please fill in all specification fields');
        return false;
      }
    } else if (step === 4) {
      // Wallet address validation - basic check 
      if (!formData.wallet_address) {
        setError('Please enter a wallet address');
        return false;
      }
      
      // Basic wallet address format validation
      if (!formData.wallet_address.startsWith('0x') || formData.wallet_address.length !== 42) {
        setError('Please enter a valid wallet address (0x followed by 40 hexadecimal characters)');
        return false;
      }
    }
    
    return true;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Copy OTP to clipboard
  const copyOtpToClipboard = () => {
    if (otpCode) {
      navigator.clipboard.writeText(otpCode);
      setOtpCopied(true);
      setTimeout(() => setOtpCopied(false), 3000);
    }
  };

  // Navigate to pending nodes page
  const goToPendingNodes = () => {
    router.push('/nodes/pending');
  };

  // Generate a mock OTP for dev mode (when service is unavailable)
  const generateMockOtp = (peerId: string): { otp: string, expiryTime: number } => {
    // Simple hash function to generate reproducible OTPs
    let hash = 0;
    for (let i = 0; i < peerId.length; i++) {
      hash = ((hash << 5) - hash) + peerId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Generate 6-digit OTP
    const otp = Math.abs(hash % 1000000).toString().padStart(6, '0');
    
    // Set expiry to 5 minutes from now
    const expiryTime = Math.floor(Date.now() / 1000) + 300;
    
    return { otp, expiryTime };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting node registration process...");
      
      let otpResponse;
      
      // In dev mode, generate a mock OTP when service is unavailable
      if (devMode && serviceStatus === 'unavailable') {
        console.log("Using dev mode with mock OTP generation");
        otpResponse = generateMockOtp(formData.peer_id!);
        setOtpCode(otpResponse.otp);
        setOtpExpiry(otpResponse.expiryTime);
        
        // Skip association and verification in dev mode
        console.log("Skipping association and verification in dev mode");
        
        // Show the YAML output for the device
        const yamlOutput = generateYamlOutput(formData as NodeRegistrationData);
        setSuccess(`[DEV MODE] Node registered with mock OTP:

## devices.yaml
${yamlOutput}`);
        
        // Set step to a new final step that shows the OTP
        setStep(6);
        setIsLoading(false);
        return;
      }
      
      // Step 1: Generate OTP code first from the OTP service
      console.log("Generating OTP code from OTP service...");
      try {
        otpResponse = await generateOtpCode(formData.peer_id!);
        console.log("OTP generated:", otpResponse);
        setOtpCode(otpResponse.otp);
        setOtpExpiry(otpResponse.expiryTime || null);
      } catch (otpError) {
        console.error("OTP generation error:", otpError);
        setError(`Failed to generate OTP: ${otpError instanceof Error ? otpError.message : 'Unknown error'}. Please check if the OTP service is running.`);
        setIsLoading(false);
        return;
      }
      
      // Step 2: Associate the node details with the OTP
      console.log("Associating node details with OTP...");
      let associationResult;
      try {
        associationResult = await associateNodeDetailsWithOtp(otpResponse.otp, formData as NodeRegistrationData);
      
        if (!associationResult) {
          console.error("Failed to associate node details with OTP");
          setError('Failed to associate node details with OTP. Please check the browser console for details and make sure the OTP service is running correctly.');
          setIsLoading(false);
          return;
        }
        
        console.log("Successfully associated node details with OTP");
      } catch (associationError) {
        console.error("Association error:", associationError);
        setError(`Error associating node details: ${associationError instanceof Error ? associationError.message : 'Unknown error'}`);
        setIsLoading(false);
        return;
      }
      
      // Step 3: Register the node with the complete data
      console.log("Registering node...");
      let result;
      try {
        result = await registerNode(formData as NodeRegistrationData);
        
        if (!result.success) {
          console.error("Node registration failed:", result);
          setError('Failed to register node. Please try again.');
          setIsLoading(false);
          return;
        }
      } catch (registrationError) {
        console.error("Registration error:", registrationError);
        setError(`Error during node registration: ${registrationError instanceof Error ? registrationError.message : 'Unknown error'}`);
        setIsLoading(false);
        return;
      }
      
      console.log("Node registration initiated. Checking with OTP service if OTP is accepted...");
      
      // Step 4: Verify with OTP service that node is registered and OTP is used
      let verificationResult;
      try {
        verificationResult = await verifyNodeRegistration(otpResponse.otp, formData.peer_id!);
      } catch (verificationError) {
        console.error("Verification error:", verificationError);
        // Continue anyway since we have the OTP
        verificationResult = false;
      }
      
      if (verificationResult) {
        console.log("Node registration confirmed by OTP service");
        
        // Show the YAML output for the device
        const yamlOutput = generateYamlOutput(formData as NodeRegistrationData);
        setSuccess(`Node registered successfully!

## devices.yaml
${yamlOutput}`);
        
        // Set step to a new final step that shows the OTP
        setStep(6);
      } else {
        console.warn("Node registration not confirmed by OTP service, but OTP is generated");
        
        // Still show the OTP to the user, but with a warning
        const yamlOutput = generateYamlOutput(formData as NodeRegistrationData);
        setSuccess(`Node registration initiated, but not yet confirmed by the OTP service.
Please use the OTP below to complete registration. If registration fails, try again.

## devices.yaml
${yamlOutput}`);
        
        // Set step to OTP display
        setStep(6);
      }
    } catch (err) {
      console.error('Error during node registration process:', err);
      setError(`An error occurred during registration: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate YAML output
  const generateYamlOutput = (data: NodeRegistrationData): string => {
    return `devices:
  - id: ${data.id}
    peer_id: ${data.peer_id}
    node_name: ${data.node_name}
    node_creation_number: ${data.node_creation_number}
    device_type: ${data.device_type}
    wallet_address: '${data.wallet_address}'
    location:
      latitude: ${data.location.latitude}
      longitude: ${data.location.longitude}
      altitude: ${data.location.altitude}
      accuracy: ${data.location.accuracy}
      satellites: ${data.location.satellites}
      timestamp: ${data.location.timestamp}
      country:
        code: ${data.location.country.code}
        name: ${data.location.country.name}
        region: ${data.location.country.region}
    specifications:
      max_wattage: ${data.specifications.max_wattage}
      voltage_range: ${data.specifications.voltage_range}
      frequency_range: ${data.specifications.frequency_range}
      battery_capacity: ${data.specifications.battery_capacity}
      phase_type: ${data.specifications.phase_type}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="aydo-title text-2xl lg:text-3xl">Register New Node</h1>
          <div className="flex items-center space-x-4">
            {serviceStatus === 'unavailable' && (
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={devMode}
                  onChange={() => setDevMode(!devMode)}
                  className="mr-1"
                />
                Dev Mode (Mock OTP)
              </label>
            )}
          <Link href="/nodes/pending" className="text-sm text-primary flex items-center">
            View Pending Nodes
            <FiArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
          </div>
        </div>
        
        {serviceStatus === 'unavailable' && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" />
            <div>
              <span className="font-semibold">OTP Service Unavailable</span>
              <p className="mt-1">The OTP service at http://localhost:3002 is not responding. Registration may fail. Please ensure the service is running and try again.</p>
              {devMode && (
                <p className="mt-1 text-amber-600">Dev Mode enabled. Registration will use a mock OTP for testing.</p>
              )}
            </div>
          </div>
        )}
        
        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center w-full">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <FiServer className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 2 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <FiMapPin className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 3 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <FiSettings className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 4 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <FiUser className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 5 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 5 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <FiClock className="w-5 h-5" />
            </div>
            {step >= 6 && (
              <>
                <div className={`flex-1 h-1 mx-2 bg-primary`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white`}>
                  <FiCheckCircle className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="aydo-card">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          
          {step < 6 && (
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Node Information</h2>
                  
                  <div>
                    <label htmlFor="deviceSetupType" className="block text-sm font-medium text-gray-700 mb-1">
                      Device Type *
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSettings className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="deviceSetupType"
                        id="deviceSetupType"
                        value={deviceSetupType}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                      >
                        <option value="generator">Solar Generator (SG)</option>
                        <option value="consumer">Solar Consumer (SC)</option>
                      </select>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      This determines your device ID prefix and configuration
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <label htmlFor="node_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Node Name *
                      </label>
                      <button 
                        type="button" 
                        onClick={generateNewName}
                        className="text-xs text-primary hover:underline"
                      >
                        Generate new name
                      </button>
                    </div>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiServer className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="node_name"
                        id="node_name"
                        value={nodeName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                        placeholder="e.g., AthensLion"
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Auto-generated from ancient cities, scientists, and animals
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="peer_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Peer ID *
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiWifi className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="peer_id"
                        id="peer_id"
                        value={formData.peer_id}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                        placeholder="e.g., 12D3KooWDGYVsHj3H2qa6KjJVGCTPaKUS2YS9Urjuwo2mcRWbhAr"
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Your node's unique peer identifier
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 flex items-start">
                    <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">About Device ID Generation</p>
                      <p className="mt-1">
                        Your Device ID will be auto-generated based on your device type and location.
                        The format follows: [TYPE_PREFIX] + 10 + [DEVICE_COUNT] + [COUNTRY_CODE] + [LOCATION_COUNT]
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Node Location</h2>
                  
                  <div>
                    <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiGlobe className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="countryCode"
                        id="countryCode"
                        value={formData.location?.country?.code || ''}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                        required
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude *
                      </label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.0001"
                          name="latitude"
                          id="latitude"
                          value={formData.location?.latitude || ''}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., -1.2921"
                          min="-90"
                          max="90"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude *
                      </label>
                      <div className="relative rounded-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.0001"
                          name="longitude"
                          id="longitude"
                          value={formData.location?.longitude || ''}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., 36.8219"
                          min="-180"
                          max="180"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="altitude" className="block text-sm font-medium text-gray-700 mb-1">
                        Altitude (meters)
                      </label>
                      <div className="relative rounded-md">
                        <input
                          type="number"
                          step="0.1"
                          name="altitude"
                          id="altitude"
                          value={formData.location?.altitude || '0'}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., 100"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700 mb-1">
                        Accuracy (meters)
                      </label>
                      <div className="relative rounded-md">
                        <input
                          type="number"
                          step="0.1"
                          name="accuracy"
                          id="accuracy"
                          value={formData.location?.accuracy || '5'}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="satellites" className="block text-sm font-medium text-gray-700 mb-1">
                      Satellites
                    </label>
                    <div className="relative rounded-md">
                      <input
                        type="number"
                        name="satellites"
                        id="satellites"
                        value={formData.location?.satellites || '8'}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                        placeholder="e.g., 8"
                        min="0"
                        max="24"
                      />
                    </div>
                  </div>
                  
                  {formData.location?.country?.code && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 flex items-start">
                      <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>
                          Selected region: <span className="font-medium">{formData.location.country.region}</span>
                        </p>
                        <p className="mt-1 text-sm">
                          Your node ID will include the country code: <span className="font-mono">{formData.location.country.code}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {formData.id && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                      <p className="font-medium">Your generated device ID:</p>
                      <p className="font-mono text-lg mt-1">{formData.id}</p>
                    </div>
                  )}
                </div>
              )}
  
              {/* Step 3: Device Specifications */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Specifications</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="max_wattage" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Wattage (W) *
                      </label>
                      <div className="relative rounded-md">
                        <input
                          type="number"
                          name="max_wattage"
                          id="max_wattage"
                          value={formData.specifications?.max_wattage}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., 1200"
                          required
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Maximum power output in watts
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="voltage_range" className="block text-sm font-medium text-gray-700 mb-1">
                        Voltage Range (V) *
                      </label>
                      <div className="relative rounded-md">
                        <input
                          type="text"
                          name="voltage_range"
                          id="voltage_range"
                          value={formData.specifications?.voltage_range}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., 220-240"
                          required
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Voltage range in volts (e.g., 220-240)
                      </p>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="frequency_range" className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency (Hz) *
                      </label>
                      <div className="relative rounded-md">
                        <input
                          type="number"
                          name="frequency_range"
                          id="frequency_range"
                          value={formData.specifications?.frequency_range}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., 50"
                          required
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Frequency in hertz
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="battery_capacity" className="block text-sm font-medium text-gray-700 mb-1">
                        Battery Capacity (Ah) *
                      </label>
                      <div className="relative rounded-md">
                        <input
                          type="number"
                          name="battery_capacity"
                          id="battery_capacity"
                          value={formData.specifications?.battery_capacity}
                          onChange={handleInputChange}
                          className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                          placeholder="e.g., 12000"
                          required
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Battery capacity in ampere-hours
                      </p>
                    </div>
                  </div>
  
                  <div>
                    <label htmlFor="phase_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Phase Type *
                    </label>
                    <div className="relative rounded-md">
                      <select
                        name="phase_type"
                        id="phase_type"
                        value={formData.specifications?.phase_type}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                        required
                      >
                        <option value="single">Single Phase</option>
                        <option value="three">Three Phase</option>
                      </select>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Type of electrical phase
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 4: Wallet */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet Information</h2>
                  
                  <div>
                    <label htmlFor="wallet_address" className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address *
                    </label>
                    <div className="relative rounded-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="wallet_address"
                        id="wallet_address"
                        value={formData.wallet_address}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                        placeholder="e.g., 0x1234..."
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Ethereum wallet address (starting with 0x)
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 flex items-start">
                    <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">About Wallet Address</p>
                      <p className="mt-1">
                        Your wallet address will be associated with this node for receiving rewards and managing node operations.
                        Make sure to enter a valid address that you control.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 5: Confirmation */}
              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm & Register</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="text-lg font-medium mb-3">Node Information</h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div className="font-medium">Device ID:</div>
                      <div className="font-mono">{formData.id}</div>
                      
                      <div className="font-medium">Node Name:</div>
                      <div>{formData.node_name}</div>
                      
                      <div className="font-medium">Creation Number:</div>
                      <div>{formData.node_creation_number}</div>
                      
                      <div className="font-medium">Device Type:</div>
                      <div>{formData.device_type}</div>
                      
                      <div className="font-medium">Peer ID:</div>
                      <div className="font-mono truncate">{formData.peer_id}</div>
                      
                      <div className="font-medium">Wallet Address:</div>
                      <div className="font-mono truncate">{formData.wallet_address}</div>
                      
                      <div className="font-medium">Location:</div>
                      <div>
                        {formData.location?.latitude}, {formData.location?.longitude}
                        <div className="text-xs text-gray-500 mt-1">
                          {formData.location?.country?.name} ({formData.location?.country?.region})
                        </div>
                      </div>
                      
                      <div className="font-medium">Altitude:</div>
                      <div>{formData.location?.altitude} meters</div>
                      
                      <div className="font-medium">Accuracy:</div>
                      <div>{formData.location?.accuracy} meters</div>
                      
                      <div className="font-medium">Satellites:</div>
                      <div>{formData.location?.satellites}</div>
                      
                      <div className="font-medium">Max Wattage:</div>
                      <div>{formData.specifications?.max_wattage} W</div>
                      
                      <div className="font-medium">Voltage Range:</div>
                      <div>{formData.specifications?.voltage_range} V</div>
                      
                      <div className="font-medium">Frequency:</div>
                      <div>{formData.specifications?.frequency_range} Hz</div>
                      
                      <div className="font-medium">Battery Capacity:</div>
                      <div>{formData.specifications?.battery_capacity} Ah</div>
                      
                      <div className="font-medium">Phase Type:</div>
                      <div>{formData.specifications?.phase_type}</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 flex items-start">
                    <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p>Please review the information above before registering your node.</p>
                      <p className="mt-1">
                        After registration, an OTP (One-Time Password) will be generated for your node using your Peer ID.
                        This OTP is required for node authentication.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="aydo-button-secondary"
                  >
                    Back
                  </button>
                )}
                
                <div className="ml-auto">
                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="aydo-button flex items-center"
                    >
                      Next
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`aydo-button flex items-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering...
                        </>
                      ) : (
                        <>
                          Register Node
                          <FiArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
          
          {/* Step 6: OTP and YAML Output */}
          {step === 6 && (
            <div className="space-y-8">
              <div className="flex items-center justify-center">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center text-gray-900">Node Registration Complete</h2>
              
              {/* OTP Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Your One-Time Password (OTP)</h3>
                <p className="text-sm mb-1 text-blue-700">
                  This is an official OTP from the Internet Computer canister. Use it to authenticate your node.
                </p>
                {otpExpiry && (
                  <p className="text-sm mb-3 text-red-600 font-semibold">
                    This OTP will expire at {new Date(otpExpiry * 1000).toLocaleTimeString()}. Use it immediately!
                  </p>
                )}
                {!otpExpiry && (
                  <p className="text-sm mb-3 text-orange-600">
                    OTPs expire quickly. Use this code immediately in your node setup process.
                </p>
                )}
                
                <div className="relative bg-white p-4 rounded-lg border border-blue-200 w-56 mx-auto">
                  <div className="text-3xl font-mono tracking-wider font-semibold text-center text-blue-900">
                    {otpCode}
                  </div>
                  <button 
                    onClick={copyOtpToClipboard}
                    className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
                    title="Copy to clipboard"
                    type="button"
                  >
                    {otpCopied ? <FiCheckCircle className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                  </button>
                  {otpCopied && (
                    <div className="text-xs text-green-600 mt-1">Copied to clipboard!</div>
                  )}
                </div>
                
                <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
                  <p className="font-semibold">Important Instructions:</p>
                  <ol className="text-left mt-1 pl-4 list-decimal">
                    <li>Copy this OTP</li>
                    <li>Run your node command in terminal</li> 
                    <li>When prompted, paste this OTP</li>
                    <li>The node will verify with the canister and complete registration</li>
                  </ol>
                </div>
              </div>
              
              {/* YAML Output */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Generated YAML Configuration</h3>
                <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-80 bg-gray-900 text-gray-100 p-4 rounded-md">
                  {success && success.trim()}
                </pre>
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={goToPendingNodes}
                  className="aydo-button flex items-center"
                >
                  View Pending Nodes
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}