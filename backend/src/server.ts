import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import hpp from "hpp";

import connectDB from "./config/database";

// API Routes
import authRoutes from "./routes/authRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";

// Register models with Mongoose (needed for populate)
import "./models/Category";
import "./models/Restaurant";
import "./models/User";

import globalErrorHandler from "./middleware/errorMiddleware";

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// CORS configuration — credentials requires explicit origins, not wildcard
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:8081,http://10.0.2.2:8081').split(',').map(s => s.trim());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Prevent parameter pollution
app.use(hpp());

// Serve static files
app.use(express.static('public'));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unmatched routes (middleware, not route — avoids Express 5 path-to-regexp issue)
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Can't find ${req.originalUrl} on this server!` });
});

// Global error handler
app.use(globalErrorHandler);

// Server start - connect to DB first, then listen
const PORT = Number(process.env.PORT) || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os') as any;
  const nets = networkInterfaces();
  let localIp = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }
  console.log(`Server running on http://${localIp}:${PORT}`);
  console.log('Development mode enabled');
  });
});

export default app;
