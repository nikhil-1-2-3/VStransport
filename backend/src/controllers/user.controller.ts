import { Request, Response } from 'express';
import User from '../models/User';
import PasswordRequest from '../models/PasswordRequest';
import { hashPassword } from '../utils/auth';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role, fullName, phone, licenseNumber } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the raw password before saving
    const passwordHash = await hashPassword(password);

    const newUser = new User({
      username,
      passwordHash,
      role,
      fullName,
      phone,
      licenseNumber
    });

    await newUser.save();

    res.status(201).json({ 
      message: `${role} created successfully`, 
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        fullName: newUser.fullName,
        phone: newUser.phone
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: (error as Error).message });
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await User.find({ role: 'DRIVER', isActive: true }).select('-passwordHash');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers', error: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, username } = req.body;
    
    // Check if new username is already taken by someone else
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'Username/Phone already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullName, username },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: (error as Error).message });
  }
};

export const requestPasswordChange = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Check if pending request exists
    const existing = await PasswordRequest.findOne({ driverId: id, status: 'PENDING' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending password change request' });
    }

    const request = new PasswordRequest({ driverId: id, reason });
    await request.save();

    res.status(201).json({ message: 'Password change request sent to Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting password change', error: (error as Error).message });
  }
};

export const getPasswordRequests = async (req: Request, res: Response) => {
  try {
    const requests = await PasswordRequest.find({ status: 'PENDING' })
      .populate('driverId', 'fullName username')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('GET_REQ_ERROR:', error);
    res.status(500).json({ message: 'Error fetching requests', error: (error as Error).message });
  }
};

export const approvePasswordRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const request = await PasswordRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (!newPassword) return res.status(400).json({ message: 'New password is required' });

    const passwordHash = await hashPassword(newPassword);
    
    // Update user password
    await User.findByIdAndUpdate(request.driverId, { passwordHash });
    
    // Mark request as approved
    request.status = 'APPROVED';
    await request.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: (error as Error).message });
  }
};
