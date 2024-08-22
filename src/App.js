import React, { useState, useEffect } from 'react';
import Map from './components/Map/Map';
import AlarmList from './components/AlarmList/AlarmList';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [editingAlarmId, setEditingAlarmId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [counter, setCounter] = useState(15);

  const handleAddAlarm = () => {
    setShowMap(true);
    setEditingAlarmId(null);
  };

  const handleSaveAlarm = (newAlarm) => {
    if (editingAlarmId) {
      setAlarms(alarms.map(alarm =>
        alarm.id === editingAlarmId ? { ...alarm, ...newAlarm } : alarm
      ));
    } else {
      setAlarms([...alarms, { ...newAlarm, id: Date.now() }]);
    }
    setShowMap(false);
    setEditingAlarmId(null);
  };

  const handleEditAlarm = (id, updates) => {
    setAlarms(alarms.map(alarm =>
      alarm.id === id ? { ...alarm, ...updates } : alarm
    ));
  };

  const handleDeleteAlarm = (id) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const handleToggleAlarm = (id) => {
    setAlarms(alarms.map(alarm =>
      alarm.id === id ? { ...alarm, active: !alarm.active } : alarm
    ));
  };

  const handleEditButtonClick = (id) => {
    setEditingAlarmId(id);
    setShowMap(true);
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

  const handleRefreshNow = () => {
    updateLocation();
    setCounter(15); // Reset the counter after refreshing
  };

  useEffect(() => {
    updateLocation(); // Initial location fetch

    const intervalId = setInterval(() => {
      setCounter((prevCounter) => (prevCounter > 0 ? prevCounter - 1 : 15));
      if (counter === 0) {
        updateLocation();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [counter]);

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
                  <AlarmList
                    alarms={alarms}
                    onEditAlarm={handleEditAlarm}
                    onDeleteAlarm={handleDeleteAlarm}
                    onToggleAlarm={handleToggleAlarm}
                    onEditButtonClick={handleEditButtonClick}
                  />
                </>
              )}
              {showMap && (
                <Map
                onSaveAlarm={handleSaveAlarm}
                editingAlarm={editingAlarmId ? alarms.find(alarm => alarm.id === editingAlarmId) : null}
                alarms={alarms}
                onToggleAlarm={handleToggleAlarm}
                setAlarms={setAlarms}           // Pass the setAlarms function as a prop
                setShowMap={setShowMap}         // Pass the setShowMap function as a prop
                setEditingAlarmId={setEditingAlarmId} // Pass the setEditingAlarmId function as a prop
                editingAlarmId={editingAlarmId} // Pass editingAlarmId as a prop
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
