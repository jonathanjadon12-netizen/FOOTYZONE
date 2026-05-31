const express = require('express');
const { getMatches, getMatchById, streamMatch, postReview, getAIRecommendations } = require('../controllers/matchController');
const { protect, gatePremiumContent } = require('../middleware/authMiddleware');

const router = express.Router();

// Fetch all matches catalogs grouped into football streaming shelves
router.get('/', protect, getMatches);

// AI Recommendation Engine matches feed
router.get('/recommendations', protect, getAIRecommendations);

// Specific match details
router.get('/:id', protect, getMatchById);

// Specific match range stream proxy
router.get('/stream/:id', protect, gatePremiumContent, streamMatch);

// Submit match review comments
router.post('/:id/reviews', protect, postReview);

module.exports = router;
