import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import timetableRoutes from './routes/timetable';
import announcementRoutes from './routes/announcements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.log('Firebase Admin init error (falling back to mock/no-auth):', error);
  }
}

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
