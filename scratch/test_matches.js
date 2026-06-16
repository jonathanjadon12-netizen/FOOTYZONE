const mongoose = require('c:/Users/Jonathan/OneDrive/Desktop/Individual-Project/server/node_modules/mongoose');

const MONGODB_URI = 'mongodb+srv://Jony:Jony@cluster0.4mbc7v7.mongodb.net/footyzone?appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define Match schema inline to query
    const MatchSchema = new mongoose.Schema({}, { strict: false, collection: 'football' });
    const Match = mongoose.model('Match', MatchSchema);

    const matches = await Match.find({});
    console.log(`Found ${matches.length} matches:`);
    matches.forEach(m => {
      console.log(`- ID: ${m._id}, Title: "${m.get('title')}", videoURL: "${m.get('videoURL')}"`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
