import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { whatsappClient } from './services/whatsapp.service';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import userRoutes from './routes/user.routes';
import truckRoutes from './routes/truck.routes';
import companyRoutes from './routes/company.routes';
import dashboardRoutes from './routes/dashboard.routes';
import issueRoutes from './routes/issue.routes';
import path from 'path';

// Connect Database
connectDB();

// Initialize WhatsApp Client
whatsappClient.initialize();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/issues', issueRoutes);

// Static file serving for photo uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.send('Transport Management Platform API');
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('update_status', (data) => {
    console.log(`Trip ${data.tripId} status updated to ${data.status}`);
    // Broadcast to all connected admins/dashboards
    io.emit('status_changed', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
