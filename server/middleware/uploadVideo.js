const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "footyzone-videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
  },
});

const upload = multer({ storage });

module.exports = upload;
