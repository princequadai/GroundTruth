import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables from .env if present
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Maximum request body size limit
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // In development or if explicitly allowed
    if (!corsOrigin || corsOrigin === '*' || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
      return callback(null, true);
    }

    const allowedOrigins = corsOrigin.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 0 && process.env.AI_API_KEY !== 'your_api_key_here');
  res.status(200).json({
    status: 'ok',
    service: 'GroundTruth API',
    version: '1.0.0',
    model: process.env.AI_MODEL || 'gemma2-9b-it',
    aiConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

// Report routes
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized safe error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[GroundTruth Server] Running on http://localhost:${PORT}`);
  console.log(`[GroundTruth Server] Model: ${process.env.AI_MODEL || 'gemma2-9b-it'}`);
  console.log(`[GroundTruth Server] AI Configured: ${Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_api_key_here')}`);
});

export default app;
