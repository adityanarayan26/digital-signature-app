import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    action: { type: String, required: true },
    userIp: { type: String },
    details: { type: String },
}, { timestamps: true });

export const Audit = mongoose.model('Audit', auditSchema);
