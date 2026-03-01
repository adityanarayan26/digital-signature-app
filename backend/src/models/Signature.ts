import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    signerName: { type: String, required: true },
    signerEmail: { type: String, required: true },
    status: { type: String, enum: ['pending', 'signed', 'rejected'], default: 'pending' },
    coordinates: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        page: { type: Number, default: 1 },
    },
    signatureToken: { type: String },
}, { timestamps: true });

export const Signature = mongoose.model('Signature', signatureSchema);
