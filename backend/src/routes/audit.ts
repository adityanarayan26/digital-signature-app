import express from 'express';
import { Audit } from '../models/Audit';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/:documentId', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const logs = await Audit.find({ documentId: req.params.documentId }).sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
