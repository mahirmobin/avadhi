const fs = require('fs');
const https = require('https');

https.get('https://mausam.imd.gov.in/imd_latest/contents/districtwise-warning_mc.php?id=4', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('imd-page.html', data);
    console.log("Wrote full HTML to imd-page.html");
  });
}).on('error', err => console.log("Error: " + err.message));
