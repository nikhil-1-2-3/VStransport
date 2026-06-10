import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordRequest extends Document {
  driverId: mongoose.Types.ObjectId;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const PasswordRequestSchema: Schema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

export default mongoose.model<IPasswordRequest>('PasswordRequest', PasswordRequestSchema);
