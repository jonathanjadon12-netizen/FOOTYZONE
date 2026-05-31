const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const Video = require("../config/models/Video");
const logger = require("../utils/logger");

// 1. Upload Video Controller (Step 5)
exports.uploadVideo = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Backend Validation (Step 10)
    if (!title || !title.trim()) {
      return res.status(400).json({ status: "fail", message: "Validation error: Title is required." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ status: "fail", message: "Validation error: Description is required." });
    }
    if (!req.file) {
      return res.status(400).json({ status: "fail", message: "Validation error: Please upload a valid video file." });
    }

    logger.info(`Starting Cloudinary streaming upload for: "${title}"...`);

    // Define Cloudinary upload stream options
    const uploadOptions = {
      resource_type: "video",
      folder: "FootyZone",
      chunk_size: 6000000 // 6MB chunks
    };

    // Upload buffer directly to Cloudinary via read streams
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      async (error, result) => {
        if (error) {
          logger.error(`Cloudinary stream upload crash: ${error.message}`);
          return res.status(500).json({
            status: "fail",
            message: "Cloudinary cloud storage upload failed.",
            error: error.message
          });
        }

        try {
          const duration = result.duration || 0;
          const public_id = result.public_id;
          
          // Secure streaming URL (Step 12)
          // Transform URLs to use q_auto, f_auto for standard dynamic compression
          const rawUrl = result.secure_url;
          const videoUrl = rawUrl.replace("/upload/", "/upload/q_auto,f_auto/");

          // Generate static frame thumbnail automatically using Cloudinary video transformations
          const thumbnail = cloudinary.url(public_id, {
            resource_type: "video",
            format: "jpg",
            secure: true,
            transformation: [
              { width: 640, height: 360, crop: "fill", start_offset: "2" } // Extract frame at 2 seconds
            ]
          });

          // Save metadata into MongoDB using Video Model (Step 11)
          const newVideo = await Video.create({
            title: title.trim(),
            description: description.trim(),
            videoUrl,
            public_id,
            thumbnail,
            duration,
            createdAt: new Date()
          });

          logger.info(`Video registered in MongoDB and seeded to Cloudinary: ${title}`);

          res.status(201).json({
            status: "success",
            message: "Video uploaded and cataloged successfully.",
            data: newVideo
          });
        } catch (dbErr) {
          logger.error(`Database registration failed: ${dbErr.message}`);
          res.status(500).json({
            status: "fail",
            message: "Upload completed, but saving metadata to database failed.",
            error: dbErr.message
          });
        }
      }
    );

    // Pipe multer memory buffer to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (err) {
    next(err);
  }
};

// 2. Delete Video Controller
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ status: "fail", message: "Video record not found inside database." });
    }

    // Record deletion so the database seeder doesn't add it back on restart
    const DeletedItem = require("../config/models/DeletedItem");
    await DeletedItem.findOneAndUpdate(
      { title: video.title.trim() },
      { title: video.title.trim() },
      { upsert: true, new: true }
    );

    logger.info(`Deleting video public_id: "${video.public_id}" from Cloudinary...`);
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.public_id, { resource_type: "video" });

    // Remove from MongoDB database
    await Video.findByIdAndDelete(req.params.id);

    logger.info(`Successfully deleted video: ${video.title}`);

    res.status(200).json({
      status: "success",
      message: "Video deleted successfully from database and Cloudinary."
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get All Videos
exports.getAllVideos = async (req, res, next) => {
  try {
    const list = await Video.find().sort("-createdAt");
    
    // Football keywords list
    const footballKeywords = [
      'football', 'soccer', 'match', 'goal', 'kick', 'tackle', 'vs', 'clásico', 'skills', 
      'cup', 'champions', 'league', 'dribble', 'dortmund', 'madrid', 'barcelona', 'messi', 
      'ronaldo', 'neymar', 'ronaldinho', 'mbappé', 'fifa', 'uefa', 'chelsea', 'arsenal', 
      'liverpool', 'manchester', 'juventus', 'milan', 'bayern', 'psg', 'derby', 'penalty', 
      'pitch', 'referee', 'tactical', 'guardiola', 'winger', 'striker', 'midfielder', 'defender', 'goalkeeper'
    ];

    const filteredList = list.filter(video => {
      const titleLower = (video.title || '').toLowerCase();
      const descLower = (video.description || '').toLowerCase();
      return footballKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword));
    });

    res.status(200).json({
      status: "success",
      results: filteredList.length,
      data: filteredList
    });
  } catch (err) {
    next(err);
  }
};

// 4. Get Video By ID
exports.getVideoById = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ status: "fail", message: "Video context not found." });
    }
    res.status(200).json({
      status: "success",
      data: video
    });
  } catch (err) {
    next(err);
  }
};

// 5. Edit Video Controller
exports.editVideo = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ status: "fail", message: "Title is required for updates." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ status: "fail", message: "Description is required for updates." });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({ status: "fail", message: "Video record not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Video details updated successfully.",
      data: updatedVideo
    });
  } catch (err) {
    next(err);
  }
};
