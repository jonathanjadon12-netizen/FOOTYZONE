const express = require('express');
const { createProfile, deleteProfile, savePlayhead, toggleWatchlist } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createProfile);
router.delete('/:id', protect, deleteProfile);
router.post('/playhead', protect, savePlayhead);
router.post('/watchlist', protect, toggleWatchlist);

module.exports = router;
