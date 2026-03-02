import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import linkRoutes from './routes/linkRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import formRoutes from './routes/formRoutes.js';
import contactCardRoutes from './routes/contactCardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { protect } from './middleware/auth.js'; // adjust path if needed

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (add auth middleware later if needed)
app.use('/api/links', linkRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/contact-cards', contactCardRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/uploads", express.static("uploads"));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Social DM SaaS API',
    version: '1.0.0',
    endpoints: {
      links: '/api/links',
      leads: '/api/leads',
      analytics: '/api/analytics'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('==> Your service is live 🚀');
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`==> Available at your primary URL ${process.env.RENDER_EXTERNAL_URL}`);
  }
});
