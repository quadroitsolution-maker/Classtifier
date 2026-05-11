import React from 'react';
import './TimetableFilter.css';

interface TimetableFilterProps {
  current: string;
  onChange: (value: string) => void;
}

const options = [
  { label: 'All', value: 'all' },
  { label: "Today's Classes", value: 'today' },
  { label: 'Lectures', value: 'lecture' },
  { label: 'Labs', value: 'lab' },
];

const TimetableFilter: React.FC<TimetableFilterProps> = ({ current, onChange }) => {
  return (
    <div className="timetable-filter">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`filter-btn ${current === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default TimetableFilter;
