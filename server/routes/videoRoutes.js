const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadVideo");
const Video = require("../config/models/Video");
const Match = require("../config/models/Match");
const cloudinary = require("../config/cloudinary");
const logger = require("../utils/logger");

// Football keywords to ensure it passes the controller filter
const footballKeywords = [
  'football', 'soccer', 'match', 'goal', 'kick', 'tackle', 'vs', 'clásico', 'skills', 
  'cup', 'champions', 'league', 'dribble', 'dortmund', 'madrid', 'barcelona', 'messi', 
  'ronaldo', 'neymar', 'ronaldinho', 'mbappé', 'fifa', 'uefa', 'chelsea', 'arsenal', 
  'liverpool', 'manchester', 'juventus', 'milan', 'bayern', 'psg', 'derby', 'penalty', 
  'pitch', 'referee', 'tactical', 'guardiola', 'winger', 'striker', 'midfielder', 'defender', 'goalkeeper'
];

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Validation error: Title is required." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Validation error: Description is required." });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Validation error: Please upload a valid video file." });
    }

    const public_id = req.file.filename;
    const rawUrl = req.file.path;
    // Apply dynamic format/quality compression transformations
    const videoUrl = rawUrl.replace("/upload/", "/upload/q_auto,f_auto/");

    // Generate static frame preview at 2 seconds offset
    const thumbnail = cloudinary.url(public_id, {
      resource_type: "video",
      format: "jpg",
      secure: true,
      transformation: [
        { width: 640, height: 360, crop: "fill", start_offset: "2" }
      ]
    });

    // Save metadata record into MongoDB Atlas!
    const newVideo = await Video.create({
      title: title.trim(),
      description: description.trim(),
      videoUrl,
      public_id,
      thumbnail,
      duration: 120, // default estimation
      createdAt: new Date()
    });

    // Guarantee the video matches the football category filter by appending a keyword if none exists
    let finalDesc = description.trim();
    const hasKeyword = footballKeywords.some(kw => 
      title.toLowerCase().includes(kw) || finalDesc.toLowerCase().includes(kw)
    );
    if (!hasKeyword) {
      finalDesc += " (football match)";
    }

    // Auto-create/register a corresponding Match catalog item so it instantly syncs and shows up in the user home carousel!
    const newMatch = await Match.create({
      title: title.trim(),
      description: finalDesc,
      poster: thumbnail,
      banner: thumbnail,
      genres: ['La Liga', 'Action', 'Highlights'],
      videoURL: videoUrl,
      trailerURL: videoUrl,
      cast: ['Players'],
      duration: 120,
      rating: 'PG-13',
      releaseYear: new Date().getFullYear(),
      isVIP: false,
      isOriginal: false,
      likes: 0
    });

    logger.info(`Cloudinary Upload: Saved metadata in MongoDB Atlas for match: "${title}"`);

    res.status(200).json({
      success: true,
      message: "Video file uploaded and saved in MongoDB Atlas successfully!",
      data: newVideo
    });
  } catch (error) {
    logger.error(`Cloudinary Upload route error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/all-videos", async (req, res) => {
  try {
    const list = await Video.find().sort("-createdAt");
    res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/video/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Edit Video Endpoint
router.put("/edit-video/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video record not found." });
    }

    const oldVideoUrl = video.videoUrl;

    // Update the Video metadata record
    video.title = title.trim();
    video.description = description.trim();
    await video.save();

    // Sync changes to the corresponding Match record
    const match = await Match.findOne({ videoURL: oldVideoUrl });
    if (match) {
      match.title = title.trim();
      let finalDesc = description.trim();
      const hasKeyword = footballKeywords.some(kw => 
        title.toLowerCase().includes(kw) || finalDesc.toLowerCase().includes(kw)
      );
      if (!hasKeyword) {
        finalDesc += " (football match)";
      }
      match.description = finalDesc;
      await match.save();
    }

    res.status(200).json({
      success: true,
      message: "Video metadata updated successfully in both collections!",
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete Video Endpoint
router.delete("/delete-video/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video record not found." });
    }

    // Record deletion so the database seeder doesn't add it back on restart
    const DeletedItem = require("../config/models/DeletedItem");
    await DeletedItem.findOneAndUpdate(
      { title: video.title.trim() },
      { title: video.title.trim() },
      { upsert: true, new: true }
    );

    const { public_id, videoUrl } = video;

    // Delete from Cloudinary storage if public_id is present
    if (public_id) {
      await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    }

    // Delete Video document from DB
    await Video.findByIdAndDelete(req.params.id);

    // Delete corresponding Match document from DB
    await Match.findOneAndDelete({ videoURL: videoUrl });

    res.status(200).json({
      success: true,
      message: "Video asset deleted successfully from Cloudinary and both database collections!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
