import mongoose, { Schema, Document } from 'mongoose';

export type TripStatus = 'ASSIGNED' | 'REACHED_PLANT' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface ITrip extends Document {
  tripNumber: string;
  driverId: mongoose.Types.ObjectId;
  truckId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  pickupLocation: string;
  deliveryLocation: string;
  status: TripStatus;
  materialDetails?: string;
  pickupGoogleMapsLink?: string;
  deliveryGoogleMapsLink?: string;
  loadWeightTons?: number;
  ratePerTon?: number;
  totalFreight?: number;
  assignedAt: Date;
  reachedPlantAt?: Date;
  loadedAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema: Schema = new Schema({
  tripNumber: { type: String, required: true, unique: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  truckId: { type: Schema.Types.ObjectId, ref: 'Truck', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  pickupLocation: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['ASSIGNED', 'REACHED_PLANT', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'], 
    default: 'ASSIGNED' 
  },
  materialDetails: { type: String },
  pickupGoogleMapsLink: { type: String },
  deliveryGoogleMapsLink: { type: String },
  loadWeightTons: { type: Number },
  ratePerTon: { type: Number },
  totalFreight: { type: Number },
  
  // Timestamps for status changes
  assignedAt: { type: Date, default: Date.now },
  reachedPlantAt: { type: Date },
  loadedAt: { type: Date },
  inTransitAt: { type: Date },
  deliveredAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<ITrip>('Trip', TripSchema);
