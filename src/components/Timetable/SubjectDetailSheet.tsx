import React, { useEffect } from 'react';
import './SubjectDetailSheet.css';
import { addEventToCalendar } from '../../utils/calendar';

interface SubjectDetailSheetProps {
  classInfo: {
    id: string;
    subject: string;
    room: string;
    faculty: string;
    attendance?: number;
    startTime: string;
    endTime: string;
    type: string;
  };
  onClose: () => void;
}

const SubjectDetailSheet: React.FC<SubjectDetailSheetProps> = ({ classInfo, onClose }) => {
  // Prevent background scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAddToCalendar = async () => {
    try {
      await addEventToCalendar({
        title: `${classInfo.subject} – ${classInfo.type}`,
        location: classInfo.room,
        description: `Instructor: ${classInfo.faculty}`,
        start: new Date(classInfo.startTime),
        end: new Date(classInfo.endTime),
      });
    } catch (e) {
      console.error('Calendar error', e);
    }
  };

  return (
    <div className="detail-sheet-backdrop" onClick={onClose} aria-label="Close detail sheet">
      <div className="detail-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="subject-title">{classInfo.subject}</h2>
        <p><strong>Room:</strong> {classInfo.room}</p>
        <p><strong>Faculty:</strong> {classInfo.faculty}</p>
        {typeof classInfo.attendance === 'number' && (
          <p><strong>Attendance:</strong> {classInfo.attendance}%</p>
        )}
        <p><strong>Time:</strong> {new Date(classInfo.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(classInfo.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        <button className="add-calendar-btn" onClick={handleAddToCalendar}>Add to Calendar</button>
      </div>
    </div>
  );
};

export default SubjectDetailSheet;
