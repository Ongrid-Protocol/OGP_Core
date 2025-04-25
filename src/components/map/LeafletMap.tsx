'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NodeData, NodeStatus } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

// Define marker icons for different node statuses
const createMarkerIcon = (status: NodeStatus) => {
  let color = '#3388ff'; // Default blue
  
  switch (status) {
    case 'active':
      color = '#10b981'; // Green
      break;
    case 'inactive':
      color = '#ef4444'; // Red
      break;
    case 'warning':
      color = '#f59e0b'; // Yellow/Amber
      break;
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Component to update map view when center changes
function SetMapView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

interface LeafletMapProps {
  nodes: NodeData[];
  center: [number, number];
  zoom: number;
}

const LeafletMap = ({ nodes, center, zoom }: LeafletMapProps) => {
  const mapId = useRef(`map-${Math.random().toString(36).substring(2, 11)}`).current;
  const [mapReady, setMapReady] = useState(false);

  // Set up Leaflet icons
  useEffect(() => {
    // Fix for Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Cleanup for Leaflet maps on component unmount
    return () => {
      if (typeof window !== 'undefined') {
        // Find all map containers
        const mapContainers = document.querySelectorAll('.leaflet-container');
        mapContainers.forEach(container => {
          // Force cleanup of any Leaflet-related artifacts
          try {
            // @ts-ignore - accessing Leaflet's private property
            if (container._leaflet_id) {
              // @ts-ignore
              delete container._leaflet_id;
            }
          } catch (e) {
            console.error('Error cleaning up map container:', e);
          }
        });
      }
    };
  }, []);

  // Mark map as ready after initialization
  useEffect(() => {
    setMapReady(true);
    return () => setMapReady(false);
  }, []);

  // Define markers for each node - stabilize data for hydration
  const nodeMarkers = nodes.map((node) => {
    // Format the lastSeen date on the client side to avoid hydration mismatch
    const formattedLastSeen = new Date(node.lastSeen).toLocaleString();
    
    // Format uptime in a stable way
    const uptimeDays = node.uptime ? Math.floor(node.uptime / 86400) : 0;
    const uptimeHours = node.uptime ? Math.floor((node.uptime % 86400) / 3600) : 0;
    const formattedUptime = node.uptime ? `${uptimeDays}d ${uptimeHours}h` : 'N/A';

    return (
      <Marker 
        key={node.id} 
        position={[node.location.lat, node.location.lng]}
        icon={createMarkerIcon(node.status)}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-bold text-lg">{node.name}</h3>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                node.status === 'active' ? 'bg-green-500' : 
                node.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="capitalize">{node.status}</span>
            </div>
            <div className="mt-2 text-sm grid grid-cols-2 gap-1">
              <span className="font-semibold">IP:</span>
              <span>{node.ip || 'N/A'}</span>
              
              <span className="font-semibold">Port:</span>
              <span>{node.port || 'N/A'}</span>
              
              <span className="font-semibold">Last Seen:</span>
              <span>{formattedLastSeen}</span>
              
              <span className="font-semibold">CPU:</span>
              <span>{node.cpu ? `${node.cpu}%` : 'N/A'}</span>
              
              <span className="font-semibold">Memory:</span>
              <span>{node.memory ? `${node.memory}%` : 'N/A'}</span>
              
              <span className="font-semibold">Uptime:</span>
              <span>{formattedUptime}</span>
            </div>
            <div className="mt-3 flex justify-end">
              <a 
                href={`/nodes/${node.id}`} 
                className="text-xs font-medium text-primary hover:underline"
              >
                View Details
              </a>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  });

  return (
    <MapContainer 
      key={mapId}
      id={mapId}
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <SetMapView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains={['a', 'b', 'c']}
      />
      {mapReady && nodeMarkers}
    </MapContainer>
  );
};

export default LeafletMap; 