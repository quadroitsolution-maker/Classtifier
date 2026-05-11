import express from 'express';
import cors from 'cors';
import './firebase'; // Initialize Firebase first
import timetableRoutes from './routes/timetable';
import announcementRoutes from './routes/announcements';
import labRoutes from './routes/labs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/labs', labRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
