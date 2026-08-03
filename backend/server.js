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
  'http://localhost:5173',
  'http://localhost:3000',
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EstateXAi API is running', time: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// DB Connection & Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

module.exports = { app, io };
