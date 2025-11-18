import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  address: string;
  onLocationChange: (lat: string, lng: string, address?: string) => void;
  height?: string;
}

// Component to handle map clicks
function LocationMarker({ position, onLocationChange }: {
  position: [number, number] | null;
  onLocationChange: (lat: string, lng: string, address?: string) => void;
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(position);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onLocationChange(lat.toString(), lng.toString());

      // Try reverse geocoding
      reverseGeocode(lat, lng).then(address => {
        if (address) {
          onLocationChange(lat.toString(), lng.toString(), address);
        }
      });
    },
  });

  // Update marker when position prop changes
  useEffect(() => {
    if (position) {
      setMarkerPosition(position);
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return markerPosition === null ? null : (
    <Marker position={markerPosition}>
      <Popup>
        <div>
          <strong>Your Selected Location</strong><br />
          Latitude: {markerPosition[0].toFixed(6)}<br />
          Longitude: {markerPosition[1].toFixed(6)}<br />
          <small>Click elsewhere on the map to change location</small>
        </div>
      </Popup>
    </Marker>
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await response.json();

    if (data.city && data.countryName) {
      return `${data.city}, ${data.countryName}`;
    } else if (data.locality) {
      return data.locality;
    }
    return null;
  } catch (error) {
    console.log('Could not reverse geocode location');
    return null;
  }
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  height = '300px'
}) => {
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Parse coordinates from props
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCurrentPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const newPosition: [number, number] = [lat, lng];

        setCurrentPosition(newPosition);
        onLocationChange(lat.toString(), lng.toString());

        // Center map on current location
        if (mapRef.current) {
          mapRef.current.setView(newPosition, 15);
        }

        // Try reverse geocoding
        reverseGeocode(lat, lng).then(address => {
          if (address) {
            onLocationChange(lat.toString(), lng.toString(), address);
          }
        });

        setIsLocating(false);
        alert('Location found! You can also click on the map to choose a different location.');
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Unable to retrieve your location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const defaultCenter: [number, number] = currentPosition || [20, 0]; // Default to equator if no position
  const defaultZoom = currentPosition ? 15 : 2;

  return (
    <div className="location-picker">
      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className="btn btn-info"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          style={{ marginRight: '1rem' }}
        >
          {isLocating ? '📍 Finding Location...' : '📍 Use Current Location'}
        </button>
        <small style={{ color: '#7f8c8d' }}>
          Click the button to use GPS, or click on the map to choose a location
        </small>
      </div>

      <div style={{
        height: height,
        width: '100%',
        border: '2px solid #ecf0f1',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationMarker
            position={currentPosition}
            onLocationChange={onLocationChange}
          />
        </MapContainer>

        {currentPosition && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255,255,255,0.9)',
            padding: '0.5rem',
            borderRadius: '5px',
            fontSize: '0.8rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            maxWidth: '200px'
          }}>
            <strong>Selected Location:</strong><br />
            Lat: {currentPosition[0].toFixed(6)}<br />
            Lng: {currentPosition[1].toFixed(6)}<br />
            {address && <><br />📍 {address}</>}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;