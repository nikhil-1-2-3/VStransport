import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  gstNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  contactPerson: { type: String },
  contactPhone: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ICompany>('Company', CompanySchema);
