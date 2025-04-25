'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiMapPin, FiServer, FiWifi, FiUser, FiLock, FiGlobe, FiCheckCircle, FiSettings, FiCpu } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { NodeRegistrationData, SolarSetupType } from '@/lib/types';
import { registerNode } from '@/lib/web3/contract';
import { processNodeRegistration } from '@/lib/icp/registry';

export default function RegisterNodePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [solarSetupType, setSolarSetupType] = useState<SolarSetupType>('generator');
  const [manualIdEntry, setManualIdEntry] = useState(false);
  const [formData, setFormData] = useState<Partial<NodeRegistrationData>>({
    id: '',
    name: '',
    device_type: 'solar_controller',
    peerId: '',
    port: 3000,
    location: { 
      lat: 0, 
      lng: 0,
      country: '',
      region: ''
    },
    walletAddress: '',
    ownerEmail: '',
    specifications: {
      max_wattage: 1000,
      voltage_range: '220V-240V',
      frequency_range: '50Hz',
      battery_capacity: '10kWh',
      phase_type: 'single'
    },
    sensors: [
      { sensor_type: 'temperature', count: 2 },
      { sensor_type: 'current', count: 4 },
      { sensor_type: 'voltage', count: 4 },
      { sensor_type: 'light', count: 1 }
    ]
  });
  const [privateKey, setPrivateKey] = useState('');

  // Generate ID based on solar setup type and other parameters
  useEffect(() => {
    if (!manualIdEntry) {
      // Get the country code from the location
      const countryCode = formData.location?.country || '';
      
      // Get the last registered device number for this type and country
      // In a real app, this would be fetched from the backend
      // For demo, we're using a simplified approach
      const getNextDeviceNumber = () => {
        // This would typically come from API
        const lastNumbers: Record<SolarSetupType, Record<string, number>> = {
          'generator': { 'KE': 4, 'NG': 2, 'ZA': 3 },
          'consumer': { 'KE': 5, 'NG': 1, 'ZA': 2 },
          'generator-consumer': { 'KE': 3, 'NG': 1, 'ZA': 1 }
        };
        
        const country = countryCode || 'KE';
        const currentNumber = lastNumbers[solarSetupType]?.[country] || 0;
        return (currentNumber + 1).toString().padStart(2, '0');
      };
      
      // Create the prefix based on solar setup type
      let prefix = '';
      let deviceTypeName = '';
      switch (solarSetupType) {
        case 'generator':
          prefix = 'SG';
          deviceTypeName = 'Solar Generator';
          break;
        case 'consumer':
          prefix = 'SC';
          deviceTypeName = 'Solar Consumer';
          break;
        case 'generator-consumer':
          prefix = 'SGC';
          deviceTypeName = 'Solar Generator and Consumer';
          break;
      }
      
      // Generate the ID and name
      if (countryCode) {
        const nextNumber = getNextDeviceNumber();
        const id = `${prefix}10${nextNumber}${countryCode}${nextNumber}`;
        const name = `${deviceTypeName} ${nextNumber.padStart(3, '0')}`;
        
        setFormData(prevData => ({
          ...prevData,
          id,
          name
        }));
      }
    }
  }, [solarSetupType, formData.location?.country, manualIdEntry]);

  // Update sensors based on phase type
  useEffect(() => {
    const phaseType = formData.specifications?.phase_type;
    
    if (phaseType === 'single') {
      updateSensors('current', 4);
      updateSensors('voltage', 4);
    } else if (phaseType === 'three') {
      updateSensors('current', 6);
      updateSensors('voltage', 6);
    }
  }, [formData.specifications?.phase_type]);

  // Helper function to update sensor counts
  const updateSensors = (type: string, count: number) => {
    const currentSensors = [...(formData.sensors || [])];
    const sensorIndex = currentSensors.findIndex(s => s.sensor_type === type);
    
    if (sensorIndex >= 0) {
      currentSensors[sensorIndex].count = count;
    } else {
      currentSensors.push({ sensor_type: type, count });
    }
    
    setFormData(prevData => ({
      ...prevData,
      sensors: currentSensors
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setFormData({
        ...formData,
        location: {
          ...formData.location!,
          [name]: parseFloat(value) || 0,
        },
      });
    } else if (name === 'country' || name === 'region') {
      setFormData({
        ...formData,
        location: {
          ...formData.location!,
          [name]: value,
        },
      });
    } else if (name === 'port' || name === 'max_wattage') {
      const numericValue = parseInt(value) || 0;
      if (name === 'port') {
        setFormData({
          ...formData,
          [name]: numericValue,
        });
      } else {
        setFormData({
          ...formData,
          specifications: {
            ...formData.specifications!,
            max_wattage: numericValue,
          }
        });
      }
    } else if (name === 'voltage_range' || name === 'frequency_range' || name === 'battery_capacity' || name === 'phase_type') {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications!,
          [name]: value,
        }
      });
    } else if (name === 'id') {
      // When manually changing ID, enable manual entry mode
      if (!manualIdEntry) {
        setManualIdEntry(true);
      }
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (name === 'name') {
      // When manually changing name, also enable manual entry mode
      if (!manualIdEntry) {
        setManualIdEntry(true);
      }
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (name === 'solarSetupType') {
      setSolarSetupType(value as SolarSetupType);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSensorChange = (type: string, count: number) => {
    updateSensors(type, count);
  };

  const validateStep = (): boolean => {
    setError(null);
    
    if (step === 1) {
      if (!formData.id || !formData.name || !formData.peerId || !formData.port) {
        setError('Please fill in all required fields');
        return false;
      }
      
      // Validate peer ID format - simple format check
      if (formData.peerId.length < 5) {
        setError('Please enter a valid Peer ID');
        return false;
      }
      
      // Validate port range
      if (formData.port < 1 || formData.port > 65535) {
        setError('Port must be between 1 and 65535');
        return false;
      }

      // Validate device ID
      if (formData.id.length < 3) {
        setError('Device ID must be at least 3 characters');
        return false;
      }
    } else if (step === 2) {
      if (!formData.location?.lat || !formData.location?.lng || !formData.location.country || !formData.location.region) {
        setError('Please enter complete location information');
        return false;
      }
      
      // Validate lat/lng ranges
      if (formData.location.lat < -90 || formData.location.lat > 90) {
        setError('Latitude must be between -90 and 90');
        return false;
      }
      
      if (formData.location.lng < -180 || formData.location.lng > 180) {
        setError('Longitude must be between -180 and 180');
        return false;
      }

      // Validate country code
      if (formData.location.country.length !== 2) {
        setError('Please enter a valid 2-letter country code');
        return false;
      }
    } else if (step === 3) {
      // Validate specifications
      if (!formData.specifications?.max_wattage || !formData.specifications.voltage_range || 
          !formData.specifications.frequency_range || !formData.specifications.battery_capacity) {
        setError('Please fill in all specification fields');
        return false;
      }
      
      if (formData.specifications.max_wattage <= 0) {
        setError('Max wattage must be greater than 0');
        return false;
      }
      
      // Check if at least one sensor is configured
      if (!formData.sensors || formData.sensors.length === 0) {
        setError('Please configure at least one sensor');
        return false;
      }
    } else if (step === 4) {
      if (!formData.walletAddress || !privateKey) {
        setError('Please enter wallet address and private key');
        return false;
      }
      
      // Basic wallet address validation
      if (!formData.walletAddress.startsWith('0x') || formData.walletAddress.length !== 42) {
        setError('Please enter a valid Ethereum wallet address');
        return false;
      }
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would send this data to your backend
      // and handle the contract signing there
      const result = await registerNode(
        formData.name!,
        formData.peerId!,
        formData.port!,
        formData.location!.lat.toString(),
        formData.location!.lng.toString(),
        privateKey
      );
      
      if (result.success) {
        // Process node registration with ICP registry
        // Include all the additional device specifications
        const icpResult = await processNodeRegistration(result.nodeId || formData.id!, {
          ...formData as NodeRegistrationData,
          id: formData.id || result.nodeId!
        });
        
        if (icpResult.success) {
          setSuccess(`Node registered successfully with ID: ${formData.id || result.nodeId}`);
          // Redirect to nodes page after a delay
          setTimeout(() => {
            router.push('/nodes');
          }, 3000);
        } else {
          // Node is registered but ICP registry update failed
          setSuccess(`Node registered with ID: ${formData.id || result.nodeId}, but ICP registry update failed. This will be retried automatically.`);
          // Still redirect since node is registered
          setTimeout(() => {
            router.push('/nodes');
          }, 5000);
        }
      } else {
        setError('Failed to register node. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Register New Node</h1>
        </div>
        
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
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
              <FiLock className="w-5 h-5" />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 5 ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 5 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:text-red-200 dark:border-red-800">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative dark:bg-green-900/30 dark:text-green-200 dark:border-green-800">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Node Information</h2>
                
                <div>
                  <label htmlFor="solarSetupType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Solar Setup Type *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSettings className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="solarSetupType"
                      id="solarSetupType"
                      value={solarSetupType}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="generator">Solar Generator (SG)</option>
                      <option value="consumer">Solar Consumer (SC)</option>
                      <option value="generator-consumer">Solar Generator-Consumer (SGC)</option>
                    </select>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This will determine the ID prefix and configuration
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Device ID *
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setManualIdEntry(!manualIdEntry)}
                      className="text-xs text-primary hover:underline"
                    >
                      {manualIdEntry ? 'Auto-generate ID & name' : 'Enter manually'}
                    </button>
                  </div>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCpu className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="id"
                      id="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="e.g., SG1004KE04"
                      readOnly={!manualIdEntry}
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {manualIdEntry ? 'Custom identifier for your device' : 'Auto-generated based on setup type and country'}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Node Name *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiServer className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="e.g., Solar Generator 004"
                      readOnly={!manualIdEntry}
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {manualIdEntry ? 'Custom name for your device' : 'Auto-generated based on setup type'}
                  </p>
                </div>

                <div>
                  <label htmlFor="device_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Device Type *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSettings className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="device_type"
                      id="device_type"
                      value={formData.device_type}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="solar_controller">Solar Controller</option>
                      <option value="wind_turbine">Wind Turbine</option>
                      <option value="battery_storage">Battery Storage</option>
                      <option value="hybrid_system">Hybrid System</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="peerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Peer ID *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiWifi className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="peerId"
                      id="peerId"
                      value={formData.peerId}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="e.g., 12D3KooWA..."
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    The IP address and location will be fetched from the ICP registry.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Port *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="port"
                      id="port"
                      min="1"
                      max="65535"
                      value={formData.port}
                      onChange={handleInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    IP address and location information will be automatically fetched from the ICP registry based on your Peer ID.
                    This information will be updated through CI/CD on all nodes in the network.
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Node Location</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Latitude *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.000001"
                        name="lat"
                        id="lat"
                        min="-90"
                        max="90"
                        value={formData.location?.lat}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., -4.0435"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Longitude *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiGlobe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.000001"
                        name="lng"
                        id="lng"
                        min="-180"
                        max="180"
                        value={formData.location?.lng}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., 39.6682"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country Code *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiGlobe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="country"
                        id="country"
                        value={formData.location?.country}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., KE"
                        maxLength={2}
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Two-letter country code (ISO 3166-1 alpha-2)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Region *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="region"
                        id="region"
                        value={formData.location?.region}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      >
                        <option value="">Select a region</option>
                        <option value="Africa">Africa</option>
                        <option value="Asia">Asia</option>
                        <option value="Europe">Europe</option>
                        <option value="North America">North America</option>
                        <option value="South America">South America</option>
                        <option value="Oceania">Oceania</option>
                        <option value="Antarctica">Antarctica</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Owner Email (optional)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="ownerEmail"
                      id="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="e.g., owner@example.com"
                    />
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Node location is used for the map view and analytics. 
                    Please provide accurate location information for your node.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Device Specifications */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Device Specifications</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="max_wattage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Wattage (W) *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="max_wattage"
                        id="max_wattage"
                        min="1"
                        value={formData.specifications?.max_wattage}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., 1600"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="voltage_range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Voltage Range *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="voltage_range"
                        id="voltage_range"
                        value={formData.specifications?.voltage_range}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., 220V-240V"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="frequency_range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Frequency Range *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="frequency_range"
                        id="frequency_range"
                        value={formData.specifications?.frequency_range}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., 50Hz"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="battery_capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Battery Capacity *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="battery_capacity"
                        id="battery_capacity"
                        value={formData.specifications?.battery_capacity}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., 16kWh"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="phase_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phase Type *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <select
                      name="phase_type"
                      id="phase_type"
                      value={formData.specifications?.phase_type}
                      onChange={handleInputChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="single">Single Phase</option>
                      <option value="three">Three Phase</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-3">Sensors Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Temperature Sensors
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.sensors?.find(s => s.sensor_type === 'temperature')?.count || 0}
                        onChange={(e) => handleSensorChange('temperature', parseInt(e.target.value) || 0)}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Sensors
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.sensors?.find(s => s.sensor_type === 'current')?.count || 0}
                        onChange={(e) => handleSensorChange('current', parseInt(e.target.value) || 0)}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Voltage Sensors
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.sensors?.find(s => s.sensor_type === 'voltage')?.count || 0}
                        onChange={(e) => handleSensorChange('voltage', parseInt(e.target.value) || 0)}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Light Sensors
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.sensors?.find(s => s.sensor_type === 'light')?.count || 0}
                        onChange={(e) => handleSensorChange('light', parseInt(e.target.value) || 0)}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    These specifications will be used for monitoring and optimizing your node's performance.
                    Please provide accurate information to ensure proper integration with the network.
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 4: Wallet and Contract (previously step 3) */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Wallet & Contract</h2>
                
                <div>
                  <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Wallet Address *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="walletAddress"
                      id="walletAddress"
                      value={formData.walletAddress}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="e.g., 0x..."
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Private Key (for contract signing) *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="privateKey"
                      id="privateKey"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Private key for signing"
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Never share your private key. It will only be used to sign the contract transaction.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Contract Information
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    By registering this node, you agree to connect to our P2P network 
                    and operate according to our network rules. The contract will be signed 
                    using your private key to verify ownership.
                  </p>
                </div>
              </div>
            )}
            
            {/* Step 5: Confirmation (previously step 4) */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">Confirm & Register</h2>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Node Information</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="font-medium">Device ID:</div>
                    <div>{formData.id}</div>
                  
                    <div className="font-medium">Name:</div>
                    <div>{formData.name}</div>
                    
                    <div className="font-medium">Device Type:</div>
                    <div className="capitalize">{formData.device_type?.replace(/_/g, ' ')}</div>
                    
                    <div className="font-medium">Peer ID:</div>
                    <div>{formData.peerId}</div>
                    
                    <div className="font-medium">Port:</div>
                    <div>{formData.port}</div>
                    
                    <div className="font-medium">Location:</div>
                    <div>{formData.location?.lat}, {formData.location?.lng} ({formData.location?.country}, {formData.location?.region})</div>
                    
                    <div className="font-medium">Phase Type:</div>
                    <div className="capitalize">{formData.specifications?.phase_type} Phase</div>
                    
                    <div className="font-medium">Specifications:</div>
                    <div>{formData.specifications?.max_wattage}W, {formData.specifications?.voltage_range}, {formData.specifications?.frequency_range}, {formData.specifications?.battery_capacity}</div>
                    
                    <div className="font-medium">Sensors:</div>
                    <div>
                      {formData.sensors?.map(sensor => 
                        `${sensor.count} ${sensor.sensor_type}`
                      ).join(', ')}
                    </div>
                    
                    <div className="font-medium">Wallet:</div>
                    <div className="truncate">{formData.walletAddress}</div>
                    
                    <div className="font-medium">Email:</div>
                    <div>{formData.ownerEmail || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Please verify the information above. Once you click "Register Node", 
                    the details will be submitted and a contract signing transaction will be initiated.
                    IP address and location will be fetched from the ICP registry based on your Peer ID.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Back
                </button>
              )}
              
              <div className="ml-auto">
                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Register Node'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}