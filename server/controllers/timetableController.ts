import { Request, Response } from 'express';
import { db } from '../firebase';

export const getSchedule = async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ error: 'Firestore not initialized' });
    
    const snapshot = await db.collection('timetable').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id, ...classData } = req.body;
    if (!db) return res.status(500).json({ error: 'Firestore not initialized' });

    if (id) {
      await db.collection('timetable').doc(id).set(classData, { merge: true });
      res.json({ message: 'Class updated', id });
    } else {
      const docRef = await db.collection('timetable').add(classData);
      res.json({ message: 'Class added', id: docRef.id });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!db) return res.status(500).json({ error: 'Firestore not initialized' });

    await db.collection('timetable').doc(id).update({ isCancelled: true });
    res.json({ message: 'Class cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addMockData = async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ error: 'Firestore not initialized' });

    const mockSchedule = [
      {
        name: 'Object Oriented Programming',
        code: 'OOPS',
        type: 'Lecture',
        startTime: '09:30 AM',
        endTime: '10:30 AM',
        location: 'Room 302',
        instructor: 'Dr. Harsha Desai',
        color: '#EC4899',
        attendance: 85,
        isCancelled: false,
        day: 0 // Monday
      },
      {
        name: 'Cloud Foundations',
        code: 'CF',
        type: 'Lab',
        startTime: '10:45 AM',
        endTime: '12:45 PM',
        location: 'Lab 103',
        instructor: 'Namrita Singh',
        color: '#6366F1',
        attendance: 92,
        isCancelled: false,
        day: 0
      }
    ];

    const batch = db.batch();
    mockSchedule.forEach(item => {
      const ref = db.collection('timetable').doc();
      batch.set(ref, item);
    });

    await batch.commit();
    res.json({ message: 'Mock data seeded' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
