import { Request, Response } from 'express';
import admin, { db } from '../firebase';
import { LabSession, LabAttendanceRecord } from '../../src/types';

export const getLabs = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('labs').get();
    const labs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(labs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markLabAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId, labId, status } = req.body;
    
    const record: LabAttendanceRecord = {
      studentId,
      labId,
      timestamp: new Date().toISOString(),
      status: status || 'Present'
    };

    await db.collection('labAttendance').add(record);

    res.status(201).json({ success: true, message: 'Lab attendance recorded' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeLabSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { summary } = req.body;

    await db.collection('labs').doc(id).update({
      status: 'Completed',
      sessionSummary: summary,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update student records (Simulated: notify students of completion)
    console.log(`Lab session ${id} completed. Summary generated.`);

    res.json({ success: true, message: 'Lab session closed and summarized' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLabAnalytics = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    
    const snapshot = await db.collection('labAttendance')
      .where('studentId', '==', studentId)
      .get();
    
    const records = snapshot.docs.map(doc => doc.data());
    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    res.json({
      totalLabs: total,
      presentCount: present,
      attendancePercentage: percentage,
      recentPerformance: 'Excellent' // Simulated insight
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
