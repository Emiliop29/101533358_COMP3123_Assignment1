
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');
const morgan = require('morgan');
const {
  errorMiddleware,
  notFound
} = require('./middleware/errorMiddleware');

const app = express();

// Trust Vercel's reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiter
app.use('/api/v1/emp', apiLimiter);

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'COMP3123 Assignment 1 API is running'
  });
});

// Error handling
app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

// Initialize database connection for Vercel
const dbPromise = connectDB();

if (require.main === module) {
  dbPromise.then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(error => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

module.exports = app;
