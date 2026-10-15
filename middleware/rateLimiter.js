
const { rateLimit } = require('express-rate-limit');

// Protect signup and login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many authentication requests. Try again later.'
  }
});

// General API protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many API requests. Try again later.'
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};
