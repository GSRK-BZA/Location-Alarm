import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import pointerImage from '../../pointer.png'; // Adjust the path as necessary

const center = {
  lat: 12.8497,
  lng: 77.6650
};

// Define the target location
const targetLocation = {
  lat: 12.8500, // Replace with the latitude of your target location
  lng: 77.6600 // Replace with the longitude of your target location
};

// Create a custom icon using the pointer.jpg
const customIcon = new L.Icon({
  iconUrl: pointerImage,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

function useSearch(setSelectedPosition, mapRef) {
  const [searchResults, setSearchResults] = useState([]);
  const provider = new OpenStreetMapProvider();

  const handleSearch = async (query) => {
    if (query.length > 2) {
      const results = await provider.search({ query });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectResult = (result) => {
    const { x, y } = result;
    setSelectedPosition({ lat: y, lng: x });
    setSearchResults([]);
    if (mapRef.current) {
      mapRef.current.flyTo([y, x], 13);
    }
  };

  return { handleSearch, searchResults, selectResult };
}

function SearchControl({ setSelectedPosition, mapRef }) {
  const { handleSearch, searchResults, selectResult } = useSearch(setSelectedPosition, mapRef);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000, backgroundColor: 'white', padding: '10px', borderRadius: '5px', width: '99%' }}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for places"
        style={{ padding: '5px', width: '98%' }}
      />
      {searchResults.length > 0 && (
        <ul style={{ listStyle: 'none', padding: '10px 0', margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
          {searchResults.map((result, index) => (
            <li key={index} onClick={() => selectResult(result)} style={{ cursor: 'pointer', padding: '5px 0' }}>
              {result.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapEvents({ setSelectedPosition }) {
  useMapEvents({
    click(e) {
      setSelectedPosition(e.latlng);
    },
  });
  return null;
}

// Function to calculate distance between two points using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function Map() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const mapRef = useRef(null);

  const handleMapClick = useCallback((e) => {
    setSelectedPosition(e.latlng);
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      const distance = getDistanceFromLatLonInKm(
        targetLocation.lat,
        targetLocation.lng,
        selectedPosition.lat,
        selectedPosition.lng
      );

      if (distance <= 1) {
        console.log('You are within 1km of the target location!');
      }
      else{
        console.log("You still have " + distance.toFixed(2) + " km to reach the target location");
      }
    }
  }, [selectedPosition]);

  return (
    <div>
      <h2>Map</h2>
      <div style={{ position: 'relative', height: '400px', width: '100%' }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <SearchControl setSelectedPosition={setSelectedPosition} mapRef={mapRef} />
          <MapEvents setSelectedPosition={setSelectedPosition} />
          <Marker position={[targetLocation.lat, targetLocation.lng]} icon={customIcon}>
            <Popup>
              Target location: <br />
              Lat: {targetLocation.lat.toFixed(4)}, <br />
              Lng: {targetLocation.lng.toFixed(4)}
            </Popup>
          </Marker>
          {selectedPosition && (
            <Marker position={selectedPosition} icon={customIcon}>
              <Popup>
                Selected location: <br />
                Lat: {selectedPosition.lat.toFixed(4)}, <br />
                Lng: {selectedPosition.lng.toFixed(4)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {selectedPosition && (
        <div>
          <h3>Selected Position:</h3>
          <p>Latitude: {selectedPosition.lat.toFixed(4)}</p>
          <p>Longitude: {selectedPosition.lng.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
}

export default Map;
