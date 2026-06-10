import mongoose, { Schema, Document } from 'mongoose';

export interface ITruck extends Document {
  registrationNumber: string;
  capacityTons: number;
  makeAndModel?: string;
  insuranceExpiry: Date;
  permitExpiry: Date;
  fitnessExpiry: Date;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TruckSchema: Schema = new Schema({
  registrationNumber: { type: String, required: true, unique: true },
  capacityTons: { type: Number, required: true },
  makeAndModel: { type: String },
  insuranceExpiry: { type: Date, required: true },
  permitExpiry: { type: Date, required: true },
  fitnessExpiry: { type: Date, required: true },
  status: { type: String, enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE'], default: 'AVAILABLE' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ITruck>('Truck', TruckSchema);
