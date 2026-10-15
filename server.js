
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

// Middleware
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/v1/emp', apiLimiter);
// User routes
app.use('/api/v1/user', userRoutes);
// Employe
app.use('/api/v1/emp', employeeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'COMP3123 Assignment 1 API is running'
  });
});

// Handle unknown endpoints
app.use(notFound);

// Centralized error handler
app.use(errorMiddleware);


const PORT = process.env.PORT || 3000;

if (require.main === module) {
  const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  };

  startServer();
}

module.exports = app;
