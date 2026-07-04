import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React bundles
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to center map when coordinates change
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Creating colored marker icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const ngoIcon = createCustomIcon('blue');       // NGO (Current User)
const restaurantIcon = createCustomIcon('green'); // Available donations
const claimIcon = createCustomIcon('orange');    // Claimed/Reserved

const MapContainer = ({ center, donations = [], userLocation = null, onClaim = null }) => {
  const defaultCenter = center || [17.3850, 78.4867]; // Hyderabad default
  
  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
      <LeafletMap 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeMapView center={defaultCenter} />

        {/* 1. Render User Location */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]} 
            icon={ngoIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>Your Location</strong>
                <p style={{ fontSize: '11px', margin: '4px 0 0 0' }}>{userLocation.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Render Nearby Donation Markers */}
        {donations.map((don) => {
          if (!don.restaurant_latitude || !don.restaurant_longitude) return null;
          
          const iconType = don.status === 'available' ? restaurantIcon : claimIcon;
          
          return (
            <Marker 
              key={don.id} 
              position={[don.restaurant_latitude, don.restaurant_longitude]} 
              icon={iconType}
            >
              <Popup>
                <div style={{ padding: '4px', maxWidth: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {don.food_type}
                    </span>
                    {don.distance_km !== undefined && (
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {don.distance_km} km away
                      </span>
                    )}
                  </div>
                  <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>{don.title}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                    By: {don.restaurant_name}
                  </span>
                  <div style={{ fontSize: '12px', marginBottom: '8px', lineHeight: '1.4' }}>
                    {don.description}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '10px' }}>
                    <span>Servings: <strong>{don.quantity}</strong></span>
                    <span>Weight: <strong>{don.weight_kg} kg</strong></span>
                  </div>
                  
                  {don.status === 'available' && onClaim && (
                    <button 
                      onClick={() => onClaim(don)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', padding: '6px' }}
                    >
                      Claim Donation
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;
