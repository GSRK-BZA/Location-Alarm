import React from 'react';
import Alarm from '../Alarm/Alarm';
import './AlarmList.css';

function AlarmList({ alarms, onEditAlarm, onDeleteAlarm, onToggleAlarm }) {
  return (
    <div className="AlarmList">
      {alarms.map((alarm) => (
        <Alarm
          key={alarm.id}
          {...alarm}
          onEdit={(id, updates) => onEditAlarm(id, updates)}
          onDelete={(id) => onDeleteAlarm(id)}
          onToggle={(id) => onToggleAlarm(id)}
        />
      ))}
    </div>
  );
}

export default AlarmList;