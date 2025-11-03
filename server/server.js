import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import socketHandler from './socket/socketHandler.js';
import routes from './routes/index.js';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://your-client-url.onrender.com'],
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', routes);

// Socket handler
socketHandler(io);

const PORT = process.env.PORT || 5000;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});