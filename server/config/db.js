const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/footyzone';
  try {
    logger.info(`Attempting to connect to MongoDB at ${uri.substring(0, 30)}...`);
    await mongoose.connect(uri, {
      autoIndex: true
    });
    logger.info('MongoDB database connection established successfully.');
  } catch (error) {
    logger.error(`MongoDB database connection crash: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
