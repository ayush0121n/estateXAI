const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const compression = require('compression');
const hpp = require('hpp');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.endsWith('.vercel.app') || origin.includes('localhost')) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

// Attach io to app so routes can use it
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join('user_' + userId);
    console.log('User ' + userId + ' joined notification room');
  });
  socket.on('disconnect', () => {});
});

// Helper to emit notification from any route
app.emitNotification = (userId, event, data) => {
  io.to('user_' + userId).emit(event, data);
};

// CORS
const allowedOrigins = [
  process.env.NODE_ENV !== 'production' && 'http://localhost:5173',
  process.env.NODE_ENV !== 'production' && 'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');

// Helmet security headers (configured to allow cross-origin images for Leaflet/Cloudinary)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// Sanitize user input to prevent NoSQL Query Injection ($gt, $ne, etc.)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compress API responses
app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' }
});

// API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/properties', require('./routes/property.routes'));
app.use('/api/pgs', require('./routes/pg.routes'));
app.use('/api/inquiries', require('./routes/inquiry.routes'));
app.use('/api/recommendations', require('./routes/recommendation.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/predict-price', apiLimiter, require('./routes/prediction.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/search', apiLimiter, require('./routes/search.routes'));
app.use('/api/commute', apiLimiter, require('./routes/commute.routes'));
app.use('/api/neighborhood', require('./routes/neighborhood.routes'));

// Root and Health check endpoints (supports Render health checks on /, /health, and /api/health)
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EstateXAi API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// DB Connection & Server Start
const PORT = process.env.PORT || 5000;

// Reconnection listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Mongoose will automatically attempt to reconnect.');
});

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB Connected');
      server.listen(PORT, () => {
        console.log('Server running on http://localhost:' + PORT);
        
        // Render Free Tier Keep-Alive (ping self every 14 mins using fetch to support HTTPS)
        const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        setInterval(async () => {
          try {
            const res = await fetch(`${serverUrl}/api/health`);
            console.log(`Keep-alive ping sent to ${serverUrl}: ${res.status}`);
          } catch (err) {
            console.warn('Keep-alive ping warning (non-fatal):', err.message);
          }
        }, 14 * 60 * 1000); // 14 mins
      });
    })
    .catch(err => {
      console.error('MongoDB Initial Connection Error:', err.message);
      // Wait 5 seconds before retrying instead of immediately hard-crashing
      setTimeout(() => {
        mongoose.connect(process.env.MONGO_URI).catch(e => console.error('MongoDB retry failed:', e.message));
      }, 5000);
    });
}

// Handle unhandled promise rejections gracefully without crashing
process.on('unhandledRejection', (err, promise) => {
  console.error('[Unhandled Rejection Caught]:', err?.stack || err?.message || err);
});

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception Caught]:', err?.stack || err?.message || err);
});

module.exports = { app, io };
