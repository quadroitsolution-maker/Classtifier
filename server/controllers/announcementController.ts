import { Request, Response } from 'express';
import admin, { db } from '../firebase';

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcementData: any = req.body;
    
    const docRef = await db.collection('announcements').add({
      ...announcementData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // In a real app, you'd trigger a Cloud Function or send notifications here
    console.log(`New announcement created for class ${announcementData.classId}`);

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Announcement posted successfully'
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { classId } = req.query;
    
    let query: admin.firestore.Query = db.collection('announcements');
    
    if (classId) {
      query = query.where('classId', '==', classId);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').limit(20).get();
    
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Handle timestamp conversion
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
