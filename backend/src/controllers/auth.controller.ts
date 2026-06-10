import { Request, Response } from 'express';
import User from '../models/User';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Seed initial admin user for setup
export const seedAdmin = async (req: Request, res: Response) => {
  try {
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (!existingAdmin) {
      const passwordHash = await hashPassword('admin123'); // Default password
      const admin = new User({
        username: 'admin',
        passwordHash,
        role: 'ADMIN',
        fullName: 'System Admin',
      });
      await admin.save();
    }

    // Also seed a test driver for the user to demo
    const existingDriver = await User.findOne({ role: 'DRIVER' });
    if (!existingDriver) {
      const driverHash = await hashPassword('driver123');
      const driver = new User({
        username: 'driver',
        passwordHash: driverHash,
        role: 'DRIVER',
        fullName: 'Test Driver',
      });
      await driver.save();
    }

    res.status(201).json({ message: 'Admin and Driver created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
