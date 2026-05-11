import { Router } from 'express';
import { 
  getSchedule, 
  updateClass, 
  cancelClass, 
  addMockData 
} from '../controllers/timetableController';

const router = Router();

router.get('/', getSchedule);
router.post('/', updateClass);
router.patch('/:id/cancel', cancelClass);
router.post('/seed', addMockData);

export default router;
