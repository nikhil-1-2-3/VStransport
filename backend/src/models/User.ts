import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: 'ADMIN' | 'DRIVER';
  fullName: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  isActive: boolean;
  status?: 'AVAILABLE' | 'ENGAGED';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'DRIVER'], required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  licenseNumber: { type: String },
  licenseExpiry: { type: Date },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['AVAILABLE', 'ENGAGED'], default: 'AVAILABLE' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
