const jwt = require('jsonwebtoken');
const User = require('../config/models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Authentication required. Token missing.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'footyzone_jwt_secret_key_123');
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'User belonging to this token no longer exists.' });
    }
    
    // Concurrent device limits check (Cap to max 4 sessions)
    const sessionActive = user.activeSessions.some((s) => s.token === token);
    if (!sessionActive) {
      return res.status(401).json({ status: 'fail', message: 'Session expired or invalidated. Please sign in again.' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    logger.error(`JWT Authorization failure: ${err.message}`);
    return res.status(401).json({ status: 'fail', message: 'Invalid or expired authentication token.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden. You do not possess structural permissions for this resource.',
      });
    }
    next();
  };
};

const gatePremiumContent = (req, res, next) => {
  // Let everyone stream all resolutions completely free and ad-free
  next();
};

module.exports = {
  protect,
  restrictTo,
  gatePremiumContent,
};
