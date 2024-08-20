import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
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

// Create custom icons
const customIcon = new L.Icon({
  iconUrl: pointerImage,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

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

function LocationMarker({ alarms, onToggleAlarm, setTriggeredAlarmName }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());

      // Check if the current location is within any active alarm's radius
      const activeAlarm = alarms.find(alarm => {
        if (!alarm.active) return false;
        const distance = getDistanceFromLatLonInKm(
          e.latlng.lat, e.latlng.lng,
          alarm.latitude, alarm.longitude
        );
        return distance <= alarm.radius;
      });

      if (activeAlarm) {
        setTriggeredAlarmName(activeAlarm.name);
        alert(`You are within the area of the alarm: ${activeAlarm.name}`);
      } else {
        setTriggeredAlarmName(null);
      }
    });
  }, [map, alarms, setTriggeredAlarmName]);

  return position === null ? null : (
    <Marker position={position} icon={currentLocationIcon}>
      <Popup>
        You are here
      </Popup>
    </Marker>
  );
}



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
  }, [searchQuery, handleSearch]);

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

function Map({ onSaveAlarm, editingAlarm, alarms, onToggleAlarm }) {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [radius, setRadius] = useState(editingAlarm ? editingAlarm.radius : 1);
  const [alarmName, setAlarmName] = useState(editingAlarm ? editingAlarm.name : '');
  const [triggeredAlarmName, setTriggeredAlarmName] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (editingAlarm) {
      setSelectedPosition({ lat: editingAlarm.latitude, lng: editingAlarm.longitude });
      setRadius(editingAlarm.radius);
      setAlarmName(editingAlarm.name);
    }
  }, [editingAlarm]);

  const handleSaveAlarm = () => {
    if (selectedPosition && alarmName) {
      onSaveAlarm({
        name: alarmName,
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        radius: radius,
        active: true,
      });
    }
  };

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.locate().on("locationfound", function (e) {
        mapRef.current.flyTo(e.latlng, mapRef.current.getZoom());
      });
    }
  };

  return (
    <div>
      <h2>{editingAlarm ? 'Edit Alarm' : 'Set Alarm Location'}</h2>
      {triggeredAlarmName && (
        <div style={{ padding: '10px', backgroundColor: 'red', color: 'white', textAlign: 'center' }}>
          <h3>You are within the area of the alarm: {triggeredAlarmName}</h3>
        </div>
      )}
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
          <LocationMarker alarms={alarms} onToggleAlarm={onToggleAlarm} setTriggeredAlarmName={setTriggeredAlarmName} />
          {selectedPosition && (
            <>
              <Marker position={selectedPosition} icon={customIcon}>
                <Popup>
                  Selected location: <br />
                  Lat: {selectedPosition.lat.toFixed(4)}, <br />
                  Lng: {selectedPosition.lng.toFixed(4)}
                </Popup>
              </Marker>
              <Circle
                center={selectedPosition}
                radius={radius * 1000}
                fillColor="blue"
                fillOpacity={0.2}
              />
            </>
          )}
          {alarms.map(alarm => (
            <Circle
              key={alarm.id}
              center={[alarm.latitude, alarm.longitude]}
              radius={alarm.radius * 1000}
              fillColor={alarm.active ? "red" : "gray"}
              fillOpacity={0.2}
            />
          ))}
        </MapContainer>
      </div>
      <button onClick={handleCenterMap}>Center on My Location</button>
      <div>
        <h3>Alarm Settings:</h3>
        <input
          type="text"
          value={alarmName}
          onChange={(e) => setAlarmName(e.target.value)}
          placeholder="Alarm Name"
        />
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          min="0.1"
          step="0.1"
          placeholder="Radius (km)"
        />
        <button onClick={handleSaveAlarm}>{editingAlarm ? 'Update' : 'Save'} Alarm</button>
      </div>
    </div>
  );
}


export default Map;