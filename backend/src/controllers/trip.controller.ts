import { Request, Response } from 'express';
import Trip from '../models/Trip';
import User from '../models/User';
import Company from '../models/Company';
import Truck from '../models/Truck';
import { sendWhatsAppMessage } from '../services/whatsapp.service';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { 
      driverId, truckId, companyId, pickupLocation, deliveryLocation, pickupGoogleMapsLink, deliveryGoogleMapsLink, materialDetails, ratePerTon, loadWeightTons
    } = req.body;

    const count = await Trip.countDocuments();
    const tripNumber = `T-${1000 + count + 1}`;

    const newTrip = new Trip({
      tripNumber,
      driverId,
      truckId,
      companyId,
      pickupLocation,
      deliveryLocation,
      pickupGoogleMapsLink,
      deliveryGoogleMapsLink,
      materialDetails,
      ratePerTon,
      loadWeightTons,
      status: 'ASSIGNED',
      assignedAt: new Date()
    });

    await newTrip.save();

    // Mark the truck and driver as ENGAGED
    await Truck.findByIdAndUpdate(truckId, { status: 'ENGAGED' });
    await User.findByIdAndUpdate(driverId, { status: 'ENGAGED' });
    
    // Fetch driver and company details for the notification
    const driver = await User.findById(driverId);
    const company = await Company.findById(companyId);

    if (driver && driver.phone) {
      const companyName = company ? company.name : 'Client';
      let msg = `🚨 *New Trip Assigned!*\n\n*Trip ID:* ${tripNumber}\n*Company:* ${companyName}\n*Pickup:* ${pickupLocation}\n*Drop-off:* ${deliveryLocation}\n`;
      if (pickupGoogleMapsLink) msg += `\n📍 *Pickup Map:* ${pickupGoogleMapsLink}`;
      if (deliveryGoogleMapsLink) msg += `\n📍 *Drop-off Map:* ${deliveryGoogleMapsLink}`;
      msg += `\n\nPlease check your TMP Driver App for more details and to update your status.`;
      
      await sendWhatsAppMessage(driver.phone, msg);
    }

    res.status(201).json({ message: 'Trip created successfully', trip: newTrip });
  } catch (error) {
    res.status(500).json({ message: 'Error creating trip', error: (error as Error).message });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const trips = await Trip.find()
      .populate('driverId', 'fullName phone')
      .populate('truckId', 'registrationNumber')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trips', error: (error as Error).message });
  }
};

export const updateTripStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.status = status;
    
    // Update timestamp based on status
    if (status === 'REACHED_PLANT') trip.reachedPlantAt = new Date();
    if (status === 'LOADED') trip.loadedAt = new Date();
    if (status === 'IN_TRANSIT') trip.inTransitAt = new Date();
    if (status === 'DELIVERED') trip.deliveredAt = new Date();
    if (status === 'COMPLETED') {
      trip.completedAt = new Date();
      // Free up the truck and driver
      if (trip.truckId) {
        await Truck.findByIdAndUpdate(trip.truckId, { status: 'AVAILABLE' });
      }
      if (trip.driverId) {
        await User.findByIdAndUpdate(trip.driverId, { status: 'AVAILABLE' });
      }
    }

    await trip.save();

    res.json({ message: `Trip status updated to ${status}`, trip });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: (error as Error).message });
  }
};

export const getDriverTrips = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const trips = await Trip.find({ driverId, status: { $ne: 'COMPLETED' } })
      .populate('companyId', 'name')
      .populate('truckId', 'registrationNumber')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver trips', error: (error as Error).message });
  }
};

export const getAllDriverTrips = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const trips = await Trip.find({ driverId })
      .populate('companyId', 'name')
      .populate('truckId', 'registrationNumber')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver history', error: (error as Error).message });
  }
};
