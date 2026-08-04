const https = require('https');

const KERALA_DISTRICTS = [
    "THIRUVANANTHAPURAM", "KOLLAM", "PATHANAMTHITTA", "ALAPPUZHA",
    "KOTTAYAM", "IDUKKI", "ERNAKULAM", "THRISSUR", "PALAKKAD",
    "MALAPPURAM", "KOZHIKODE", "WAYANAD", "KANNUR", "KASARAGOD"
];

https.get('https://mausam.imd.gov.in/imd_latest/contents/districtwise-warning_mc.php?id=4', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const regex = /"title":\s*"([^"]+)"[\s\S]*?"color":\s*"([^"]+)"/g;
        let match;
        const keralaMetData = {};
        
        while ((match = regex.exec(data)) !== null) {
            let title = match[1].trim().toUpperCase();
            let color = match[2].trim().toUpperCase();
            
            // Normalize "KOTTYAM" to "KOTTAYAM" if they misspelled it
            if (title === 'KOTTYAM') title = 'KOTTAYAM';
            
            if (KERALA_DISTRICTS.includes(title)) {
                let warning = 'Green Alert';
                if (color === '#FF0000') warning = 'Red Alert';
                else if (color === '#FFA500') warning = 'Orange Alert';
                else if (color === '#FFFF00') warning = 'Yellow Alert';
                
                keralaMetData[title] = { color, warning };
            }
        }
        
        console.log("Extracted IMD Live Data for Kerala:");
        console.log(JSON.stringify(keralaMetData, null, 2));
    });
}).on('error', err => console.log("Network Error: " + err.message));
