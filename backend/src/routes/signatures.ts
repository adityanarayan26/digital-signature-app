import express from 'express';
import { Signature } from '../models/Signature';
import { Document } from '../models/Document';
import { Audit } from '../models/Audit';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const { documentId, signerName, signerEmail, coordinates } = req.body;

        const doc = await Document.findOne({ _id: documentId, owner: req.user.userId });
        if (!doc) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');

        const signature = new Signature({
            documentId,
            signerName,
            signerEmail,
            coordinates,
            signatureToken: token,
            status: 'pending'
        });

        await signature.save();

        res.status(201).json({ message: 'Signature requested successfully', signature, sharingLink: `/sign/${token}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:documentId', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const signatures = await Signature.find({ documentId: req.params.documentId });
        res.status(200).json(signatures);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: express.Response) => {
    try {
        const { coordinates } = req.body;
        const signature = await Signature.findByIdAndUpdate(req.params.id, { coordinates }, { new: true });
        res.status(200).json(signature);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

router.get('/public/:token', async (req: express.Request, res: express.Response) => {
    try {
        const signature = await Signature.findOne({ signatureToken: req.params.token }).populate('documentId');
        if (!signature) {
            res.status(404).json({ error: 'Invalid or expired signature link' });
            return;
        }
        res.status(200).json(signature);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

router.post('/finalize/:token', async (req: express.Request, res: express.Response) => {
    try {
        const signature = await Signature.findOne({ signatureToken: req.params.token }).populate('documentId');
        if (!signature) {
            res.status(404).json({ error: 'Invalid token' });
            return;
        }

        if (signature.status === 'signed') {
            res.status(400).json({ error: 'Already signed' });
            return;
        }

        const doc = signature.documentId as any;
        const documentPath = path.join(__dirname, '../../', doc.fileUrl);

        // Read Original PDF
        const existingPdfBytes = fs.readFileSync(documentPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the page
        const pages = pdfDoc.getPages();
        const targetPage = pages[(signature.coordinates?.page || 1) - 1]; // 0-indexed

        // Embed signature text
        const { width, height } = targetPage.getSize();
        // coordinates mapping: react-pdf coordinates (y from top) vs pdf-lib coordinates (y from bottom)
        const pdfY = height - (signature.coordinates?.y || 0) - 20;

        targetPage.drawText(`Signed by: ${signature.signerName}`, {
            x: signature.coordinates?.x || 50,
            y: pdfY,
            size: 16,
            color: rgb(0, 0.53, 0.71),
        });

        targetPage.drawText(`Date: ${new Date().toLocaleDateString()}`, {
            x: signature.coordinates?.x || 50,
            y: pdfY - 15,
            size: 10,
            color: rgb(0, 0, 0),
        });

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const newFileName = `signed-${Date.now()}-${path.basename(doc.fileUrl)}`;
        const newPath = path.join(__dirname, '../../uploads', newFileName);
        fs.writeFileSync(newPath, pdfBytes);

        // Update signature status
        signature.status = 'signed';
        await signature.save();

        await Audit.create({
            documentId: doc._id,
            action: 'Document Signed',
            details: `Signed by ${signature.signerName} (${signature.signerEmail})`
        });

        res.status(200).json({ message: 'Document signed successfully', fileUrl: `/uploads/${newFileName}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
