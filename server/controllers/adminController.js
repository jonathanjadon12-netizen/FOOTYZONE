const User = require('../config/models/User');
const Match = require('../config/models/Match');
const Video = require('../config/models/Video');
const logger = require('../utils/logger');

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ 'subscription.plan': { $ne: 'free' } });
    const totalMatches = await Match.countDocuments();

    // Sum subscription revenue
    const revenue = 0;

    // Mock active watch stats for chart presentation
    const analytics = {
      summary: {
        totalUsers,
        premiumUsers,
        totalMatches,
        totalRevenue: Math.round(revenue * 100) / 100,
        activeWatchTime: 12450 // in hours
      },
      chartData: [
        { label: 'Jan', revenue: Math.round(revenue * 0.1) },
        { label: 'Feb', revenue: Math.round(revenue * 0.2) },
        { label: 'Mar', revenue: Math.round(revenue * 0.3) },
        { label: 'Apr', revenue: Math.round(revenue * 0.5) },
        { label: 'May', revenue: Math.round(revenue) }
      ],
      planDistribution: {
        free: totalUsers - premiumUsers,
        premium_monthly: await User.countDocuments({ 'subscription.plan': 'premium_monthly' }),
        premium_yearly: await User.countDocuments({ 'subscription.plan': 'premium_yearly' })
      }
    };

    res.status(200).json({ status: 'success', data: analytics });
  } catch (err) {
    next(err);
  }
};

exports.uploadMatch = async (req, res, next) => {
  try {
    const { title, description, poster, banner, genres, videoURL, trailerURL, cast, duration, rating, releaseYear, isVIP, isOriginal } = req.body;
    
    const genreArray = Array.isArray(genres) ? genres : genres.split(',').map(g => g.trim());
    const castArray = Array.isArray(cast) ? cast : cast.split(',').map(c => c.trim());

    const defaultPoster = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
    const defaultBanner = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';

    const newMatch = await Match.create({
      title,
      description,
      poster: poster || defaultPoster,
      banner: banner || defaultBanner,
      genres: genreArray,
      videoURL: videoURL || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      trailerURL: trailerURL || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      cast: castArray,
      duration: Number(duration),
      rating,
      releaseYear: Number(releaseYear),
      isVIP: isVIP === 'true' || isVIP === true,
      isOriginal: isOriginal === 'true' || isOriginal === true,
      likes: 0
    });

    // Save corresponding Video document in database
    const finalVideoURL = videoURL || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const existingVideo = await Video.findOne({ videoUrl: finalVideoURL });
    if (!existingVideo) {
      await Video.create({
        title: title.trim(),
        description: description.trim(),
        videoUrl: finalVideoURL,
        public_id: 'external_' + Date.now(), // Satisfy mongoose validation for external stream links
        thumbnail: poster || defaultPoster,
        duration: Number(duration) * 60 || 120, // minutes to seconds
        createdAt: new Date()
      });
      logger.info(`Admin: Automatically synchronized and saved corresponding Video document for: "${title}"`);
    }

    res.status(201).json({ status: 'success', data: newMatch });
  } catch (err) {
    next(err);
  }
};

exports.deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ status: 'fail', message: 'Match not found.' });
    }

    // Record deletion so the database seeder doesn't add it back on restart
    const DeletedItem = require('../config/models/DeletedItem');
    await DeletedItem.findOneAndUpdate(
      { title: match.title.trim() },
      { title: match.title.trim() },
      { upsert: true, new: true }
    );

    // Also find and delete corresponding Video in database and Cloudinary
    const video = await Video.findOne({ videoUrl: match.videoURL });
    if (video) {
      if (video.public_id) {
        try {
          const cloudinary = require('../config/cloudinary');
          await cloudinary.uploader.destroy(video.public_id, { resource_type: "video" });
          logger.info(`Admin: Successfully deleted linked Cloudinary video asset: ${video.public_id}`);
        } catch (cloudErr) {
          logger.error(`Admin: Cloudinary deletion failed inside deleteMatch: ${cloudErr.message}`);
        }
      }
      await Video.findByIdAndDelete(video._id);
      logger.info(`Admin: Successfully deleted linked Video database record for: "${match.title}"`);
    }

    await Match.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Match deleted successfully from database.' });
  } catch (err) {
    next(err);
  }
};

exports.editMatch = async (req, res, next) => {
  try {
    const { title, description, genres, videoURL, poster, cast, duration, releaseYear, isOriginal } = req.body;
    const genreArray = Array.isArray(genres) ? genres : (genres ? genres.split(',').map(g => g.trim()) : undefined);

    const oldMatch = await Match.findById(req.params.id);
    if (!oldMatch) {
      return res.status(404).json({ status: 'fail', message: 'Match not found.' });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        ...(genreArray && { genres: genreArray }),
        videoURL,
        poster,
        banner: poster, // keep banner aligned with custom thumbnail
        cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map(c => c.trim()) : undefined),
        duration: duration ? Number(duration) : undefined,
        releaseYear: releaseYear ? Number(releaseYear) : undefined,
        isOriginal: isOriginal !== undefined ? (isOriginal === 'true' || isOriginal === true) : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updatedMatch) {
      return res.status(404).json({ status: 'fail', message: 'Match not found.' });
    }

    // Sync modifications to corresponding Video database document
    const video = await Video.findOne({ videoUrl: oldMatch.videoURL });
    if (video) {
      if (title) video.title = title.trim();
      if (description) video.description = description.trim();
      if (videoURL) video.videoUrl = videoURL;
      if (poster) video.thumbnail = poster;
      if (duration) video.duration = Number(duration) * 60; // minutes to seconds
      await video.save();
      logger.info(`Admin: Synchronized edit changes to corresponding Video record: "${title}"`);
    }

    res.status(200).json({ status: 'success', data: updatedMatch });
  } catch (err) {
    next(err);
  }
};

exports.getAllMatches = async (req, res, next) => {
  try {
    const matches = await Match.find().sort('-createdAt');
    res.status(200).json({ status: 'success', data: matches });
  } catch (err) {
    next(err);
  }
};
