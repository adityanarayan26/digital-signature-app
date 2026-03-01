import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Document } from '../models/Document';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res: express.Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const { title } = req.body;

        const newDoc = new Document({
            title: title || req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            owner: req.user.userId,
        });

        await newDoc.save();

        res.status(201).json({ message: 'File uploaded successfully', document: newDoc });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const docs = await Document.find({ owner: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json(docs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, owner: req.user.userId });
        if (!doc) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }
        res.status(200).json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
