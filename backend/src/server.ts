import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import docsRoutes from './routes/docs';
import signatureRoutes from './routes/signatures';
import auditRoutes from './routes/audit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/audit', auditRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Database connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.warn('MONGO_URI is not defined. Skipping DB connection for now.');
            return;
        }
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
