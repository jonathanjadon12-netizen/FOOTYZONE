const http = require('http');
const jwt = require('c:/Users/Jonathan/OneDrive/Desktop/Individual-Project/server/node_modules/jsonwebtoken');
const mongoose = require('c:/Users/Jonathan/OneDrive/Desktop/Individual-Project/server/node_modules/mongoose');

const MONGODB_URI = 'mongodb+srv://Jony:Jony@cluster0.4mbc7v7.mongodb.net/footyzone?appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const User = mongoose.model('User', UserSchema);

    // Find the admin user
    const user = await User.findOne({ email: 'admin@footyzone.com' });
    if (!user) {
      console.error('Admin user not found');
      mongoose.disconnect();
      return;
    }

    const userId = user._id.toString();
    console.log('Found admin user ID:', userId);

    // Generate JWT token
    const token = jwt.sign({ id: userId }, 'streamzone_jwt_secret_key_123');
    console.log('Generated JWT Token:', token);

    // Add session to activeSessions to pass the concurrent session check
    user.set('activeSessions', [{ token, deviceId: 'test-device', lastActive: new Date() }]);
    await user.save();
    console.log('Saved active session to DB');

    mongoose.disconnect();

    const matchId = '6a1c55105909caf4f46dee5e'; // MANCHESTER UNITED VS BRIGHTON

    // Test 1: Request WITHOUT Range header
    console.log('\n--- Test 1: Request WITHOUT Range header ---');
    const req1 = http.get(`http://127.0.0.1:5000/api/matches/stream/${matchId}?token=${token}`, (res) => {
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Body:', body);
        
        // Test 2: Request WITH Range header
        console.log('\n--- Test 2: Request WITH Range header ---');
        const options = {
          headers: {
            Range: 'bytes=0-100'
          }
        };
        const req2 = http.get(`http://127.0.0.1:5000/api/matches/stream/${matchId}?token=${token}`, options, (res2) => {
          console.log('Status Code:', res2.statusCode);
          console.log('Headers:', res2.headers);
          
          let chunks = [];
          res2.on('data', chunk => chunks.push(chunk));
          res2.on('end', () => {
            const data = Buffer.concat(chunks);
            console.log('Downloaded chunk length:', data.length);
          });
        });
      });
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
