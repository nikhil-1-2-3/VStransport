import { Request, Response } from 'express';
import Truck from '../models/Truck';

export const createTruck = async (req: Request, res: Response) => {
  try {
    const { registrationNumber, capacityTons, makeAndModel, insuranceExpiry, permitExpiry, fitnessExpiry } = req.body;

    const existingTruck = await Truck.findOne({ registrationNumber });
    if (existingTruck) {
      return res.status(400).json({ message: 'Truck with this registration already exists' });
    }

    const truck = new Truck({
      registrationNumber,
      capacityTons,
      makeAndModel,
      insuranceExpiry,
      permitExpiry,
      fitnessExpiry
    });

    await truck.save();
    res.status(201).json({ message: 'Truck created successfully', truck });
  } catch (error) {
    res.status(500).json({ message: 'Error creating truck', error: (error as Error).message });
  }
};

export const getTrucks = async (req: Request, res: Response) => {
  try {
    const trucks = await Truck.find({ isActive: true });
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trucks', error: (error as Error).message });
  }
};
