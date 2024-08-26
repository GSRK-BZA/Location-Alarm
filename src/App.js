import React, { useState, useEffect } from 'react';
import Map from './components/Map/Map';
import AlarmList from './components/AlarmList/AlarmList';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import axios from 'axios';
import audio2 from './iphone_alarm.mp3';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [counter, setCounter] = useState(15);

  const handleAddAlarm = () => {
    setShowMap(true);
  };



  const handleSaveAlarm = (newAlarm) => {
    setAlarms([...alarms, { ...newAlarm, id: Date.now() }]);
    setShowMap(false);
  };

  const handleDeleteAlarm = async (id) => {
    try {
      await axios.delete(`https://server-orcin-psi.vercel.app/api/alarms/${id}`);
      setAlarms(alarms.filter(alarm => alarm._id !== id));
    } catch (error) {
      console.error("Error deleting alarm:", error);
    }
  };

  const checkAlarms = () => {
    if (currentLocation) {
      alarms.forEach(alarm => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          alarm.latitude,
          alarm.longitude
        );

        if (distance <= alarm.radius) {
          const audio = new Audio(audio2); // Adjust the path if necessary
          audio.play();
          handleDeleteAlarm(alarm._id);
          fetchAlarms();
        }
      });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error retrieving location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const fetchAlarms = async () => {
    try {
      const response = await axios.get('https://server-orcin-psi.vercel.app/api/alarms');
      setAlarms(response.data);
    } catch (error) {
      console.error("Error fetching alarms:", error);
    }
  };

  // fetchAlarms();

  const handleRefreshNow = () => {
    updateLocation();
    fetchAlarms();
    setCounter(15); // Reset the counter after refreshing
  };

  useEffect(() => {
    // updateLocation(); // Initial location fetch // Initial alarms fetch

    const intervalId = setInterval(() => {
      setCounter((prevCounter) => (prevCounter > 0 ? prevCounter - 1 : 15));
      if (counter === 0) {
        updateLocation();
        fetchAlarms();
      }
      checkAlarms(); // Check alarms on every counter tick
    }, 1000);

    return () => clearInterval(intervalId);
  }, [counter, currentLocation, alarms]);

  return (
    <Router>
      <div className="App">
        <h1>Location-based Alarm App</h1>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              {!showMap && (
                <>
                  <button onClick={handleAddAlarm}>Add Alarm</button>
                  <div className="location-info">
                    {currentLocation ? (
                      <div>
                        <p>Latitude: {currentLocation.latitude}</p>
                        <p>Longitude: {currentLocation.longitude}</p>
                      </div>
                    ) : (
                      <p>Fetching location...</p>
                    )}
                    <p>Next update in: {counter} seconds</p>
                    <button onClick={handleRefreshNow}>Refresh Now</button>
                  </div>
                  <AlarmList alarms={alarms} onDeleteAlarm={handleDeleteAlarm} />
                </>
              )}
              {showMap && (
                <Map
                  onSaveAlarm={handleSaveAlarm}
                  alarms={alarms}
                  setAlarms={setAlarms}
                  setShowMap={setShowMap}
                />
              )}
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
