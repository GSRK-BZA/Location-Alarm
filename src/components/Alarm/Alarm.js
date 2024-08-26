import React from 'react';
import './Alarm.css';

function Alarm({ id, name, latitude, longitude, radius, onDelete }) {
  return (
    <div className="Alarm">
      <h3>{name}</h3>
      <p>Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}</p>
      <p>Radius: {radius} km</p>
      <button onClick={() => onDelete(id)}>Delete Alarm</button>
    </div>
  );
}

export default Alarm;
