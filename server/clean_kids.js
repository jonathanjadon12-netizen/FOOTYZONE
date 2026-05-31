const mongoose = require('mongoose');
const User = require('./config/models/User');

const run = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/footyzone';
  try {
    await mongoose.connect(uri);
    console.log('Connected to database for cleanup...');
    const result = await User.updateMany(
      {},
      { $pull: { profiles: { profileName: 'Zone Kids' } } }
    );
    console.log(`Successfully cleaned up profiles. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

run();
