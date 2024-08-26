import React from 'react';
import Alarm from '../Alarm/Alarm';
import './AlarmList.css';

function AlarmList({ alarms, onDeleteAlarm }) {
  return (
    <div className="AlarmList">
      {alarms.map((alarm) => (
        <Alarm
          key={alarm._id}
          {...alarm}
          onDelete={() => onDeleteAlarm(alarm._id)}
        />
      ))}
    </div>
  );
}

export default AlarmList;
