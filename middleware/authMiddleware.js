
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.'
      });
    }

    // Extract JWT
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Invalid authorization header'
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    );

    // Find authenticated user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists'
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    console.error('Authentication error:', error.message);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = authMiddleware;
