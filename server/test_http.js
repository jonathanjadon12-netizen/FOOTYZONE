const http = require('http');

http.get('http://127.0.0.1:5000/health', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error(`HTTP Error: ${err.message}`);
  process.exit(1);
});
