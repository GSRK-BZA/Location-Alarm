import React, { useState } from 'react';
import Map from './components/Map/Map';
import AlarmList from './components/AlarmList/AlarmList';
import './App.css';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [editingAlarmId, setEditingAlarmId] = useState(null);

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

  return (
    <div className="App">
      <h1>Location-based Alarm App</h1>
      {!showMap && (
        <>
          <button onClick={handleAddAlarm}>Add Alarm</button>
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
        />
      )}
    </div>
  );
}

export default App;