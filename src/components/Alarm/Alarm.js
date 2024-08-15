import React, { useState } from 'react';
import './Alarm.css';

function Alarm({ id, name, latitude, longitude, radius, active, onEdit, onDelete, onToggle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedRadius, setEditedRadius] = useState(radius);

  const handleEdit = () => {
    onEdit(id, { name: editedName, radius: editedRadius });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(name);
    setEditedRadius(radius);
    setIsEditing(false);
  };

  return (
    <div className={`Alarm ${active ? 'active' : 'inactive'}`}>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <input
            type="number"
            value={editedRadius}
            onChange={(e) => setEditedRadius(Number(e.target.value))}
            min="0.1"
            step="0.1"
          />
          <button onClick={handleEdit}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      ) : (
        <>
          <h3>{name}</h3>
          <p>Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}</p>
          <p>Radius: {radius} km</p>
          <button onClick={() => onToggle(id)}>{active ? 'Deactivate' : 'Activate'}</button>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(id)}>Delete</button>
        </>
      )}
    </div>
  );
}

export default Alarm;