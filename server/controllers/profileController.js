const User = require('../config/models/User');

exports.createProfile = async (req, res, next) => {
  try {
    const { name, avatar, isKids } = req.body;
    
    if (req.user.profiles.length >= 5) {
      return res.status(400).json({ status: 'fail', message: 'Maximum profile limit reached. Cannot exceed 5 slots.' });
    }

    const newProfile = {
      profileName: name,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      contentPreference: isKids ? 'kids' : 'all',
      language: 'en'
    };

    req.user.profiles.push(newProfile);
    await req.user.save({ validateBeforeSave: false });

    res.status(201).json({
      status: 'success',
      data: req.user.profiles[req.user.profiles.length - 1]
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    req.user.profiles = req.user.profiles.filter(p => p._id.toString() !== req.params.id);
    await req.user.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', message: 'Profile removed successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.savePlayhead = async (req, res, next) => {
  try {
    const { profileId, movieId, playhead } = req.body;
    const user = req.user;
    
    const profile = user.profiles.find(p => p._id.toString() === profileId);
    if (!profile) {
      return res.status(404).json({ status: 'fail', message: 'Profile context not found.' });
    }

    const existingIndex = profile.watchHistory.findIndex(h => h.movieId.toString() === movieId);
    if (existingIndex > -1) {
      profile.watchHistory[existingIndex].playhead = playhead;
      profile.watchHistory[existingIndex].lastWatched = Date.now();
    } else {
      profile.watchHistory.push({
        movieId,
        playhead,
        lastWatched: Date.now()
      });
    }

    await user.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', message: 'Playhead saved.' });
  } catch (err) {
    next(err);
  }
};

exports.toggleWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const index = req.user.watchlist.indexOf(movieId);
    if (index > -1) {
      req.user.watchlist.splice(index, 1);
    } else {
      req.user.watchlist.push(movieId);
    }
    await req.user.save({ validateBeforeSave: false });
    res.status(200).json({ status: 'success', data: req.user.watchlist });
  } catch (err) {
    next(err);
  }
};
