import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB');

    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        passwordHash,
        role: 'ADMIN',
        fullName: 'System Administrator'
      });
      await admin.save();
      console.log('Created default admin: admin / admin123');
    } else {
      console.log('Admin already exists.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

setup();
