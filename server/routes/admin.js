const express = require('express');
const { getAnalytics, uploadMatch, deleteMatch, editMatch, getAllMatches } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, restrictTo('admin'), getAnalytics);
router.get('/matches', protect, restrictTo('admin'), getAllMatches);
router.post('/upload', protect, restrictTo('admin'), uploadMatch);
router.delete('/delete/:id', protect, restrictTo('admin'), deleteMatch);
router.put('/edit/:id', protect, restrictTo('admin'), editMatch);

module.exports = router;
