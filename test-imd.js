const fs = require('fs');
const https = require('https');

const fetchJson = (url, callback) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => callback(data));
    }).on('error', err => callback("Error: " + err.message));
};

fetchJson('https://mausam.imd.gov.in/imd_latest/contents/district_shapefiles/mc_thiruvananthapuram.json', (data1) => {
    fs.writeFileSync('imd-mc-tvm.json', data1);
    console.log("Saved mc_thiruvananthapuram.json. Snip: ", data1.substring(0, 300));
    
    fetchJson('https://mausam.imd.gov.in/imd_latest/contents/district_shapefiles/DISTRICT_F-2.json', (data2) => {
        fs.writeFileSync('imd-dist.json', data2);
        console.log("Saved DISTRICT_F-2.json");
    });
});
