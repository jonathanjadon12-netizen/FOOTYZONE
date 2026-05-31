const mongoose = require('mongoose');

const atlasUri = 'mongodb+srv://Jony:Jony@cluster0.4mbc7v7.mongodb.net/footyzone?appName=Cluster0';
const localUri = 'mongodb://localhost:27017/footyzone';

const testConn = async (name, uri) => {
  console.log(`\nTesting connection to ${name}...`);
  try {
    const conn = await Promise.race([
      mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out after 5 seconds')), 5500))
    ]);
    console.log(`${name} connected successfully!`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`${name} connection failed: ${err.message}`);
    return false;
  }
};

const run = async () => {
  const atlasOk = await testConn('MongoDB Atlas', atlasUri);
  const localOk = await testConn('Local MongoDB', localUri);
  process.exit(0);
};

run();
