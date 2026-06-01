const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../config/models/User');
const { chatWithAI, getChatHistory, getLiveSportsData, logSearchHistory } = require('../controllers/chatController');

const router = express.Router();

// Optional authentication middleware: parses the token if present but never blocks the request if absent (enabling guest access!)
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'footyzone_jwt_secret_key_123');
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    // If token is invalid or expired, just proceed as guest session
    next();
  }
};

// 1. Post Chat message (free for guest + registered users)
router.post('/', optionalProtect, chatWithAI);

// 2. Retrieve Chat History (free for guest + registered users)
router.get('/history', optionalProtect, getChatHistory);

// 3. Fetch Live Sports Scores, standinds & fixtures (free, cached, and public)
router.get('/live', getLiveSportsData);

// 4. Log User search queries & return quick search hits
router.post('/search', optionalProtect, logSearchHistory);

module.exports = router;
