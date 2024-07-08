import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
require('dotenv').config();

const mapapi = process.env.mapsApiKey;
const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function Map() {
  const [map, setMap] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(center);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const autocompleteRef = useRef(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      setSelectedPosition({ lat: location.lat(), lng: location.lng() });
      map.panTo(location);
    }
  };

  const handleMapClick = (event) => {
    setSelectedPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  };

  return (
    <LoadScript googleMapsApiKey= {mapapi} libraries={['places']}>
      <h2>Map</h2>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <input
          type="text"
          placeholder="Search for places"
          style={{ width: '300px', height: '40px', marginBottom: '10px' }}
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {selectedPosition && (
          <Marker position={selectedPosition} />
        )}
      </GoogleMap>
      {selectedPosition && (
        <div>
          <p>Selected Position: Lat: {selectedPosition.lat}, Lng: {selectedPosition.lng}</p>
        </div>
      )}
    </LoadScript>
  );
}

export default Map;
