'use client';

import { useState, useEffect, memo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NodeData, NodeStatus } from '@/lib/types';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

// Create a non-SSR Leaflet map component to avoid hydration issues
const MapComponent = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

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

interface NodeMapProps {
  nodes: NodeData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

function NodeMap({ nodes, center = [30, 0], zoom = 2, height = '600px' }: NodeMapProps) {
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted client-side only
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden shadow-lg">
      {mounted && (
        <MapComponent 
          nodes={nodes}
          center={center}
          zoom={zoom}
        />
      )}
    </div>
  );
}

export default memo(NodeMap); 