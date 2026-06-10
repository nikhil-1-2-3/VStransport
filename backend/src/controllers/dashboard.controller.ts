import { Request, Response } from 'express';
import Trip from '../models/Trip';
import Truck from '../models/Truck';
import User from '../models/User';
import Company from '../models/Company';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const activeTripsCount = await Trip.countDocuments({ status: { $ne: 'COMPLETED' } });
    const totalTrucksCount = await Truck.countDocuments();
    const availableTrucksCount = await Truck.countDocuments({ status: 'AVAILABLE' });
    const activeDriversCount = await User.countDocuments({ role: 'DRIVER', isActive: true });
    
    // Calculate total tonnage from COMPLETED or DELIVERED trips
    const tonnageResult = await Trip.aggregate([
      { $match: { status: { $in: ['DELIVERED', 'COMPLETED'] } } },
      { $group: { _id: null, totalTonnage: { $sum: "$loadWeightTons" } } }
    ]);
    
    const totalTonnage = tonnageResult.length > 0 ? tonnageResult[0].totalTonnage : 0;

    res.json({
      activeTrips: activeTripsCount,
      totalTrucks: totalTrucksCount,
      availableTrucks: availableTrucksCount,
      activeDrivers: activeDriversCount,
      totalTonnageMoved: totalTonnage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: (error as Error).message });
  }
};
