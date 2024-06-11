import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/tasks', authMiddleware, (req, res) => {
    res.send('This is a protected route');
});

export default router;
