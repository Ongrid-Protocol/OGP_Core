// Arrays of ancient cities, scientists, and animals for node name generation
export const ancientCities = [
  'Athens', 'Rome', 'Babylon', 'Carthage', 'Troy', 'Thebes', 'Alexandria', 
  'Persepolis', 'Memphis', 'Nineveh', 'Ur', 'Mycenae', 'Sparta', 'Byzantium',
  'Luxor', 'Pompeii', 'Petra', 'Damascus', 'Jericho', 'Ephesus', 'Delphi',
  'Knossos', 'Timbuktu', 'Varanasi', 'Xian'
];

export const scientists = [
  'Einstein', 'Newton', 'Curie', 'Darwin', 'Tesla', 'Galileo', 'Hawking',
  'Aristotle', 'Sagan', 'Turing', 'Lovelace', 'Bohr', 'Pasteur', 'Maxwell',
  'Feynman', 'Goodall', 'Planck', 'Fermi', 'Heisenberg', 'Faraday', 'Rutherford',
  'Mendel', 'Franklin', 'Kepler', 'Copernicus'
];

export const animals = [
  'Eagle', 'Lion', 'Elephant', 'Dolphin', 'Tiger', 'Wolf', 'Rhino', 'Zebra',
  'Panda', 'Penguin', 'Leopard', 'Hawk', 'Falcon', 'Cheetah', 'Gorilla',
  'Jaguar', 'Koala', 'Owl', 'Lynx', 'Hippo', 'Gazelle', 'Baboon', 'Fox',
  'Orca', 'Bison'
];

/**
 * Generates a unique node name by combining two categories from ancient cities, scientists, and animals.
 * The node name follows camelCase format with no spaces.
 */
export function generateNodeName(): string {
  // Randomly select which two categories to use
  const categories = ['cities', 'scientists', 'animals'];
  const shuffled = [...categories].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 2);
  
  let firstName = '';
  let secondName = '';
  
  // Get random name from each selected category
  for (const category of selected) {
    if (category === 'cities') {
      const randomCity = ancientCities[Math.floor(Math.random() * ancientCities.length)];
      if (!firstName) firstName = randomCity;
      else secondName = randomCity;
    } else if (category === 'scientists') {
      const randomScientist = scientists[Math.floor(Math.random() * scientists.length)];
      if (!firstName) firstName = randomScientist;
      else secondName = randomScientist;
    } else if (category === 'animals') {
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      if (!firstName) firstName = randomAnimal;
      else secondName = randomAnimal;
    }
  }
  
  // Combine the two names without a space
  return firstName + secondName;
}

/**
 * Generates the next device ID based on the device type, count, location code, and location count.
 */
export function generateDeviceId(
  deviceType: 'generator' | 'consumer',
  countryCode: string,
  deviceCount: number = 1,
  locationCount: number = 1
): string {
  // Create prefix based on device type
  let prefix = '';
  switch (deviceType) {
    case 'generator':
      prefix = 'SG';
      break;
    case 'consumer':
      prefix = 'SC';
      break;
  }
  
  // Format numbers with padding
  const deviceCountStr = deviceCount.toString().padStart(2, '0');
  const locationCountStr = locationCount.toString().padStart(2, '0');
  
  // Generate the ID in the format: PREFIX + 10 + deviceCount + countryCode + locationCount
  return `${prefix}10${deviceCountStr}${countryCode}${locationCountStr}`;
} 