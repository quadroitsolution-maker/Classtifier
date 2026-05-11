import { Router } from 'express';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController';

const router = Router();

router.post('/', createAnnouncement);
router.get('/', getAnnouncements);

export default router;
