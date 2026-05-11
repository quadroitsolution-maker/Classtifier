import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // assume firebase is initialized
import { format, isToday, isSameDay } from 'date-fns';
import SubjectDetailSheet from './SubjectDetailSheet';
import TimetableFilter from './TimetableFilter';
import './Timetable.css';

interface Slot {
  start: string; // HH:mm
  end: string;   // HH:mm
}

interface ClassEntry {
  id: string;
  subject: string;
  room: string;
  faculty: string;
  color: string; // hex color for subject code
  cancelled?: boolean;
  attendance?: number; // percent
  startTime: string; // ISO string
  endTime: string;   // ISO string
  type: 'lecture' | 'lab';
}

const Timetable: React.FC = () => {
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassEntry | null>(null);
  const [filter, setFilter] = useState<string>('all'); // all, today, lecture, lab, faculty:<name>, subject:<code>

  useEffect(() => {
    const q = query(collection(db, 'timetables'), orderBy('startTime'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: ClassEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ClassEntry, 'id'>),
      }));
      setClasses(data);
      setLoading(false);
    }, (error) => {
      console.error('Error loading timetable:', error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredClasses = classes.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'today') return isSameDay(new Date(c.startTime), new Date());
    if (filter === 'lecture') return c.type === 'lecture';
    if (filter === 'lab') return c.type === 'lab';
    if (filter.startsWith('faculty:')) return c.faculty === filter.split(':')[1];
    if (filter.startsWith('subject:')) return c.subject === filter.split(':')[1];
    return true;
  });

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const renderSkeleton = () => (
    <div className="timetable-skeleton">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );

  const handleClassClick = (c: ClassEntry) => {
    setSelectedClass(c);
  };

  return (
    <div className="timetable-container">
      <TimetableFilter current={filter} onChange={setFilter} />
      <div className="weekday-strip">
        {weekdays.map((day) => (
          <div key={day} className="weekday-item">{day}</div>
        ))}
      </div>
      {loading ? (
        renderSkeleton()
      ) : (
        <div className="grid-container">
          {filteredClasses.map((c) => {
            const isCurrent = isSameDay(new Date(c.startTime), new Date()) &&
              new Date() >= new Date(c.startTime) && new Date() <= new Date(c.endTime);
            const classClass = `class-card ${c.cancelled ? 'cancelled' : ''} ${isCurrent ? 'current' : ''}`;
            return (
              <div
                key={c.id}
                className={classClass}
                style={{ backgroundColor: c.color }}
                onClick={() => handleClassClick(c)}
              >
                <div className="subject">{c.subject}</div>
                <div className="time">{format(new Date(c.startTime), 'HH:mm')} - {format(new Date(c.endTime), 'HH:mm')}</div>
                {c.cancelled && <div className="cancelled-label">Cancelled</div>}
              </div>
            );
          })}
        </div>
      )}
      {selectedClass && (
        <SubjectDetailSheet classInfo={selectedClass} onClose={() => setSelectedClass(null)} />
      )}
    </div>
  );
};

export default Timetable;
