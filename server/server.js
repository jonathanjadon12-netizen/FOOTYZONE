const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seeder');
const errorHandler = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

// Routes Import
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const profileRoutes = require('./routes/profiles');
const adminRoutes = require('./routes/admin');
const videoRoutes = require('./routes/videoRoutes');
const chatRoutes = require('./routes/chat');


const app = express();
const server = http.createServer(app);

// Configure Socket.io with robust CORS headers
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection & Seeding
connectDB().then(() => {
  seedDatabase();
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/chat', chatRoutes);


// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Watch Party WebSocket Sync Manager
io.on('connection', (socket) => {
  logger.info(`WebSocket Client Connected: ${socket.id}`);

  // Join Room
  socket.on('join_party', ({ roomId, username }) => {
    socket.join(roomId);
    logger.info(`Watch Party: ${username} joined room ${roomId}`);
    // Broadcast join details to room participants
    socket.to(roomId).emit('party_announcement', {
      message: `${username} joined the cinematic room.`
    });
  });

  // Sync Playback coords
  socket.on('sync_video', ({ roomId, playhead, isPlaying }) => {
    socket.to(roomId).emit('video_state_changed', { playhead, isPlaying });
  });

  // Share Live Chat Message
  socket.on('send_chat', ({ roomId, username, text }) => {
    io.to(roomId).emit('chat_received', {
      username,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Send Floating Emojis Blast
  socket.on('send_emoji_blast', ({ roomId, emoji }) => {
    socket.to(roomId).emit('emoji_blast_received', { emoji });
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info(`WebSocket Client Disconnected: ${socket.id}`);
  });
});

// Express Fallback Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`FOOTYZONE Football Streaming Platform running in development mode on PORT ${PORT}`);
});
