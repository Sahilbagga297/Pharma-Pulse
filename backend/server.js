import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import cors from 'cors';

const app = express();
dotenv.config();
connectDB();

// Configure CORS for file downloads
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Disposition']
}));

app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use('/api/users', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/doctors', doctorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;