const Match = require('../config/models/Match');
const Review = require('../config/models/Review');
const logger = require('../utils/logger');
const https = require('https');

exports.getMatches = async (req, res, next) => {
  try {
    const matches = await Match.find();
    
    // Football keywords list
    const footballKeywords = [
      'football', 'soccer', 'match', 'goal', 'kick', 'tackle', 'vs', 'clásico', 'skills', 
      'cup', 'champions', 'league', 'dribble', 'dortmund', 'madrid', 'barcelona', 'messi', 
      'ronaldo', 'neymar', 'ronaldinho', 'mbappé', 'fifa', 'uefa', 'chelsea', 'arsenal', 
      'liverpool', 'manchester', 'juventus', 'milan', 'bayern', 'psg', 'derby', 'penalty', 
      'pitch', 'referee', 'tactical', 'guardiola', 'winger', 'striker', 'midfielder', 'defender', 'goalkeeper'
    ];

    const filterFootball = (item) => {
      const titleLower = (item.title || '').toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      return footballKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword));
    };

    const filteredMatches = matches.filter(filterFootball);

    // Helper to cleanly check genres or title substrings (robust against null or missing fields)
    const hasGenre = (m, genreList) => {
      const genresArray = Array.isArray(m.genres) ? m.genres : [];
      const titleStr = typeof m.title === 'string' ? m.title : '';
      return genresArray.some(g => typeof g === 'string' && genreList.some(kw => g.toLowerCase().trim() === kw.toLowerCase().trim())) ||
             genreList.some(kw => titleStr.toLowerCase().includes(kw.toLowerCase()));
    };

    // Group categories matching requested shelves
    const feed = {
      uefaChampionsLeague: filteredMatches.filter(m => hasGenre(m, ['UEFA Champions League', 'Champions League'])),
      premierLeague: filteredMatches.filter(m => hasGenre(m, ['Premier League'])),
      laLiga: filteredMatches.filter(m => hasGenre(m, ['La Liga'])),
      worldCup: filteredMatches.filter(m => hasGenre(m, ['World Cup'])),
      internationalMatches: filteredMatches.filter(m => hasGenre(m, ['International matches', 'International Friendly', 'International'])),
      clubMatches: filteredMatches.filter(m => hasGenre(m, ['Club Matches', 'Club'])),
      compilations: filteredMatches.filter(m => hasGenre(m, ['compilations', 'Compilation', 'Highlights', 'Bloopers', 'Funny', 'Skills', 'Goals', 'Saves', 'Defence', 'Passing', 'Comedy'])),
      trending: [...filteredMatches].sort((a, b) => b.likes - a.likes).slice(0, 10),
      originals: filteredMatches.filter(m => m.isOriginal)
    };

    res.status(200).json({ status: 'success', data: feed });
  } catch (err) {
    next(err);
  }
};

exports.getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: 'fail', message: 'Match not found.' });
    }
    const reviews = await Review.find({ matchId: req.params.id }).sort('-createdAt');
    res.status(200).json({ status: 'success', data: { content: match, type: 'movie', reviews } });
  } catch (err) {
    next(err);
  }
};

// Advanced HTTP 206 Byte-Range Streaming Engine Proxy
exports.streamMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: 'fail', message: 'Video asset not found.' });
    }

    const videoUrl = match.videoURL;
    const range = req.headers.range;

    if (!range) {
      return res.status(400).json({ status: 'fail', message: 'Range header missing. Requires byte-range stream.' });
    }

    // Make an HTTP request to get the file size first or proxy request segments
    https.get(videoUrl, (response) => {
      const totalSize = parseInt(response.headers['content-length'], 10);
      
      // Parse Range: e.g. "bytes=323223-"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024 - 1, totalSize - 1); // 1MB chunks

      const chunkSize = (end - start) + 1;
      
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4"
      };

      res.writeHead(206, headers);

      // Fetch chunk from source url
      const requestOptions = {
        headers: {
          Range: `bytes=${start}-${end}`
        }
      };

      https.get(videoUrl, requestOptions, (chunkResponse) => {
        chunkResponse.pipe(res);
      }).on('error', (err) => {
        logger.error(`Streaming chunk pipe broken: ${err.message}`);
      });

    }).on('error', (err) => {
      logger.error(`Streaming source connection failed: ${err.message}`);
      res.status(500).json({ status: 'fail', message: 'Error establishing connection with video cloud storage.' });
    });

  } catch (err) {
    next(err);
  }
};

exports.postReview = async (req, res, next) => {
  try {
    const { rating, text } = req.body;
    const newReview = await Review.create({
      userId: req.user._id,
      name: req.user.name,
      matchId: req.params.id,
      rating,
      text
    });
    res.status(201).json({ status: 'success', data: newReview });
  } catch (err) {
    next(err);
  }
};

// AI Recommendation Engine
exports.getAIRecommendations = async (req, res, next) => {
  try {
    const matches = await Match.find();
    
    // Core AI calculation:
    // Gather all genres that user has watched in their active profile history
    const userProfile = req.user.profiles.find(p => p._id.toString() === req.query.profileId);
    
    if (!userProfile || userProfile.watchHistory.length === 0) {
      // Fallback to top rated items if history is empty
      const recommendations = matches.map(m => ({
        ...m.toObject(),
        matchPercentage: Math.floor(Math.random() * 15) + 80 // 80-95%
      })).slice(0, 6);
      return res.status(200).json({ status: 'success', data: recommendations });
    }

    const watchedIds = userProfile.watchHistory.map(h => h.matchId ? h.matchId.toString() : (h.movieId ? h.movieId.toString() : ''));
    const watchedMatches = await Match.find({ _id: { $in: watchedIds.filter(id => id) } });
    
    const genreAffinities = {};
    watchedMatches.forEach(m => {
      m.genres.forEach(g => {
        genreAffinities[g] = (genreAffinities[g] || 0) + 1;
      });
    });

    // Score unwatched matches by overlapping affinities
    const scored = matches
      .filter(m => !watchedIds.includes(m._id.toString()))
      .map(m => {
        let score = 0;
        m.genres.forEach(g => {
          score += genreAffinities[g] || 0;
        });
        
        // Convert to percentage
        const baseMatch = 70;
        const bonus = Math.min(score * 5, 29); // caps bonus at 29%
        const randomFactor = Math.floor(Math.random() * 5); // 0-4%
        return {
          ...m.toObject(),
          matchPercentage: baseMatch + bonus + randomFactor
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6);

    res.status(200).json({ status: 'success', data: scored });
  } catch (err) {
    next(err);
  }
};
