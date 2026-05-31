const jwt = require('jsonwebtoken');
const User = require('../config/models/User');
const logger = require('../utils/logger');

const signToken = (id, role) => {
  const expiry = role === 'admin' ? '5m' : '365d';
  return jwt.sign({ id }, process.env.JWT_SECRET || 'footyzone_jwt_secret_key_123', {
    expiresIn: expiry,
  });
};

const createSendToken = async (user, statusCode, req, res) => {
  const token = signToken(user._id, user.role);
  
  // Record device sessions
  const session = {
    token,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    device: req.headers['user-agent'] || 'Web Browser',
  };
  
  // Capping concurrent devices to 4 screens max
  if (user.activeSessions.length >= 4) {
    user.activeSessions.shift(); // Evict oldest
  }
  user.activeSessions.push(session);
  
  // Reset brute-force lockout triggers
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  
  await user.save({ validateBeforeSave: false });
  
  const cookieExpiry = user.role === 'admin' ? 5 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
  res.cookie('token', token, {
    expires: new Date(Date.now() + cookieExpiry),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please fill in all fields.' });
    }

    // Validate name has no numbers
    if (/\d/.test(name)) {
      return res.status(400).json({ status: 'fail', message: 'Name should not contain numbers.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: 'fail', message: 'Please enter a valid email address.' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Email address already registered inside our database.' });
    }
    
    const newUser = await User.create({
      name,
      email,
      password,
      profileImage: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      profiles: [
        {
          profileName: 'Primary Profile',
          avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
          isKids: false,
        }
      ]
    });
    
    logger.info(`User Registered: ${email}. Initial primary profile provisioned.`);
    await createSendToken(newUser, 201, req, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, mfaCode } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide both email and password properties.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: 'fail', message: 'Please enter a valid email address.' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }
    
    // Lockout verification
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        status: 'fail',
        message: `Account temporarily locked due to excessive failed attempts. Please retry in ${minutesLeft} minute(s).`,
      });
    }
    
    const isCorrect = await user.comparePassword(password);
    if (!isCorrect) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 10 * 60 * 1000; // 10 mins lockout
        logger.warn(`Security Lockout Triggered: user ${email} locked for 10 minutes.`);
      }
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password.' });
    }
    
    // Numerical MFA Lock Check
    if (email === 'admin@footyzone.com') {
      if (!mfaCode) {
        return res.status(202).json({
          status: 'mfa_required',
          message: 'Secure Padlock MFA activated. Please enter your numerical verification pin.',
        });
      }
      if (mfaCode !== '090354') {
        return res.status(401).json({ status: 'fail', message: 'MFA Code mismatch. Access denied.' });
      }
    }
    
    logger.info(`User authenticated: ${email}. Registering device session.`);
    await createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = req.user;
    const token = req.token;
    
    user.activeSessions = user.activeSessions.filter((s) => s.token !== token);
    await user.save({ validateBeforeSave: false });
    
    res.clearCookie('token');
    res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.logoutAll = async (req, res, next) => {
  try {
    const user = req.user;
    user.activeSessions = [];
    await user.save({ validateBeforeSave: false });
    
    res.clearCookie('token');
    res.status(200).json({ status: 'success', message: 'Terminated all active sessions across devices.' });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
