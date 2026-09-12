import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import detectRoutes from './routes/detectRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Security Headers & CORS
app.use((helmet as any)({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use((cors as any)({
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching localhost
    if (!origin || origin.startsWith('http://localhost') || origin === CORS_ORIGIN) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in development, configurable for production
    }
  },
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter on API
app.use('/api', apiLimiter);

// Health Check & Root
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Cyber Shield API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      detect: '/api/detect',
      scans: '/api/scans',
      admin: '/api/admin',
      chat: '/api/chat'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Cyber Shield Detection Engine',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/detect', detectRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Cyber Shield Backend running on http://localhost:${PORT}`);
    logger.info(`API Healthcheck: http://localhost:${PORT}/api/health`);
  });
}

export default app;
