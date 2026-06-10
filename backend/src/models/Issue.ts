import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  driverId: mongoose.Types.ObjectId;
  description: string;
  category: 'VEHICLE_ISSUE' | 'ACCIDENT' | 'CHALLAN' | 'OTHER';
  photoUrl?: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema: Schema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['VEHICLE_ISSUE', 'ACCIDENT', 'CHALLAN', 'OTHER'], 
    default: 'OTHER' 
  },
  photoUrl: { type: String },
  status: { 
    type: String, 
    enum: ['OPEN', 'RESOLVED'], 
    default: 'OPEN' 
  },
}, { timestamps: true });

export default mongoose.model<IIssue>('Issue', IssueSchema);
