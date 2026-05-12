import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Course } from '../types';

export const useTimetable = (day: number) => {
  const [schedule, setSchedule] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // In a real app, you might also filter by 'section' or 'studentId'
    const q = query(
      collection(db, 'timetable'),
      where('day', '==', day)
      // orderBy('startTime', 'asc') // This might need a composite index
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      // Sort manually if index isn't ready
      const sortedData = data.sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
        return timeA - timeB;
      });

      setSchedule(sortedData);
      setLoading(false);
    }, (err) => {
      console.error('Firestore Error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [day]);

  return { schedule, loading, error };
};
