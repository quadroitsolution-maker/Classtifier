import { Router } from 'express';
import { 
  getLabs, 
  markLabAttendance, 
  completeLabSession, 
  getLabAnalytics 
} from '../controllers/labController';

const router = Router();

router.get('/', getLabs);
router.post('/attendance', markLabAttendance);
router.patch('/:id/complete', completeLabSession);
router.get('/analytics', getLabAnalytics);

export default router;
