const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`Express error caught: ${err.message}\nStack: ${err.stack}`);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'Internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
