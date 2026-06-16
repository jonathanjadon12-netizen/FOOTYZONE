const https = require('https');

const videoUrl = 'https://res.cloudinary.com/dmnixz83x/video/upload/v1780033151/manu_vs_brighton_mozrjq.mp4';

console.log('Sending request to:', videoUrl);

https.get(videoUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  // If redirect, log target
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirect location:', res.headers.location);
  }
}).on('error', (err) => {
  console.error('Error:', err.message);
});
