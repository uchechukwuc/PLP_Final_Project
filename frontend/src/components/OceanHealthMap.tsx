import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PollutionReport {
  _id: string;
  type: string;
  severity: string;
  description: string;
  location: {
    coordinates: [number, number];
  };
  address: string;
  createdAt: string;
  status: string;
  reporter?: {
    username: string;
  };
}

interface OceanHealthMapProps {
  center?: [number, number];
  zoom?: number;
  showReports?: boolean;
}

const OceanHealthMap: React.FC<OceanHealthMapProps> = ({
  center = [20, 0], // Default center on equator
  zoom = 2,
  showReports = true
}) => {
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showReports) {
      fetchReports();
    }
  }, [showReports]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/map`);
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#27ae60';
      case 'resolved': return '#3498db';
      case 'pending': return '#f39c12';
      case 'false_positive': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      plastic_waste: '🗑️',
      oil_spill: '🛢️',
      chemical_pollution: '⚠️',
      fishing_gear: '🎣',
      general_debris: '🗂️'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  return (
    <div style={{ height: 'clamp(300px, 50vh, 600px)', width: '100%', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          Loading pollution data...
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ocean health overlay - simplified representation */}
        {/* In a real implementation, this would use actual ocean health data */}
        <Circle
          center={[20, -20]}
          radius={500000}
          pathOptions={{
            color: '#3498db',
            fillColor: '#3498db',
            fillOpacity: 0.1,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <h4>🌊 Atlantic Ocean</h4>
              <p>General ocean health monitoring area</p>
              <p><strong>Status:</strong> Moderate concern</p>
              <p><strong>Key issues:</strong> Plastic pollution, overfishing</p>
            </div>
          </Popup>
        </Circle>

        <Circle
          center={[10, 120]}
          radius={800000}
          pathOptions={{
            color: '#e67e22',
            fillColor: '#e67e22',
            fillOpacity: 0.1,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <h4>🌊 Pacific Ocean</h4>
              <p>General ocean health monitoring area</p>
              <p><strong>Status:</strong> High concern</p>
              <p><strong>Key issues:</strong> Coral bleaching, plastic gyres</p>
            </div>
          </Popup>
        </Circle>

        {/* Pollution reports markers */}
        {showReports && reports.map((report) => (
          <Marker
            key={report._id}
            position={[report.location.coordinates[1], report.location.coordinates[0]]}
            icon={L.divIcon({
              html: `<div style="
                background-color: ${getSeverityColor(report.severity)};
                border: 2px solid white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              ">${getTypeIcon(report.type)}</div>`,
              className: 'custom-marker',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>
              <div style={{ maxWidth: '250px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                  {getTypeIcon(report.type)} {report.type.replace('_', ' ').toUpperCase()}
                </h4>

                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    background: getSeverityColor(report.severity),
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {report.severity.toUpperCase()}
                  </span>
                  <span style={{
                    background: getStatusColor(report.status),
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {report.description}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                  <p style={{ margin: '0 0 4px 0' }}>
                    📍 {report.address}
                  </p>
                  <p style={{ margin: '0 0 4px 0' }}>
                    📅 {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {report.reporter && (
                    <p style={{ margin: '0' }}>
                      👤 Reported by {report.reporter.username}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OceanHealthMap;