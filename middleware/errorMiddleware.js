
const errorMiddleware = (err, req, res, next) => {
  console.error('API Error:', err.message);

  // Invalid JSON request
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Invalid JSON format'
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate entry found'
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(err.errors).map(
        error => error.message
      )
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }

  // Other HTTP errors
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      message: err.message || 'Request failed'
    });
  }

  // Unexpected errors
  return res.status(500).json({
    message: 'Internal server error'
  });
};

const notFound = (req, res) => {
  return res.status(404).json({
    message: 'Endpoint not found'
  });
};

module.exports = {
  errorMiddleware,
  notFound
};
