const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const DISTRICTS = [
  { code: 'TVM', name: 'Thiruvananthapuram', handle: '@Dist_Admin_Tvm' },
  { code: 'KLM', name: 'Kollam', handle: '@dckollam' },
  { code: 'PTA', name: 'Pathanamthitta', handle: '@DistrictCollectorPta' },
  { code: 'ALP', name: 'Alappuzha', handle: '@districtcollectoralappuzha' },
  { code: 'KTM', name: 'Kottayam', handle: '@CollectorKottayam' },
  { code: 'IDK', name: 'Idukki', handle: '@CollectorIdukki' },
  { code: 'EKM', name: 'Ernakulam', handle: '@ernakulamdc' },
  { code: 'TCR', name: 'Thrissur', handle: '@ThrissurCollector' },
  { code: 'PKD', name: 'Palakkad', handle: '@CollectorPalakkad' },
  { code: 'MLP', name: 'Malappuram', handle: '@malappuramcollector' },
  { code: 'KKD', name: 'Kozhikode', handle: '@collectorkozhikode' },
  { code: 'WYD', name: 'Wayanad', handle: '@wayanadcollector' },
  { code: 'KNR', name: 'Kannur', handle: '@collector.kannur' },
  { code: 'KSD', name: 'Kasaragod', handle: '@CollectorKasaragod' }
];

const KEYWORDS = [
  'അവധി', 'avadi', 'holiday', 'educational institutions', 'വിദ്യാഭ്യാസ', 'സ്ഥാപനങ്ങൾക്ക്', 
  'schools', 'colleges', 'anganwadis', 'tuition', 'professional colleges'
];

async function checkHolidays() {
  const parser = new Parser();
  const statusPath = path.join(__dirname, '..', 'public', 'status.json');
  
  let currentStatus = {};
  if (fs.existsSync(statusPath)) {
      try {
          currentStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      } catch (e) {
          currentStatus = {};
      }
  }

  const now = new Date();
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
  
  for (const district of DISTRICTS) {
     const envKey = `${district.code}_RSS_URL`;
     // Fallbacks for the feeds provided by the user
     let rssUrl = process.env[envKey] || '';
     if (!rssUrl) {
         if (district.code === 'EKM') rssUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDnTBs81wq.rss';
         if (district.code === 'KNR') rssUrl = 'https://rss.app/feeds/81efmB9dArRoJ05S.xml';
         if (district.code === 'TCR') rssUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDp37eWD0H.rss';
     }
     
     let isHoliday = false;
     let announcementText = "";
     let originalPostUrl = "";
     let announcedAt = "";

     if (rssUrl) {
         try {
             console.log(`Fetching feed for ${district.name}...`);
             const feed = await parser.parseURL(rssUrl);
             const items = feed.items || [];
             items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
             
             for (const item of items) {
                 const pubDate = new Date(item.pubDate);
                 if (now - pubDate > FORTY_EIGHT_HOURS) {
                     continue; 
                 }
                 
                 const text = (item.content || item.contentSnippet || item.title || "").toLowerCase();
                 const hasKeyword = KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
                 const isFalsePositive = text.includes('no holiday') || text.includes('പ്രവൃത്തിദിനം') || text.includes('working day') || text.includes('regular class');
                 
                 if (hasKeyword && !isFalsePositive) {
                     isHoliday = true;
                     announcementText = item.contentSnippet || item.title;
                     originalPostUrl = item.link;
                     announcedAt = item.pubDate;
                     break; 
                 }
             }
         } catch (err) {
             console.error(`Failed to parse RSS for ${district.name}:`, err.message);
         }
     } else {
         console.log(`Skipping ${district.name}, no RSS URL configured (${envKey}).`);
     }

     currentStatus[district.code] = {
         name: district.name,
         handle: district.handle,
         isHoliday,
         announcementText: isHoliday ? announcementText : (rssUrl ? "No holiday announcement detected recently." : "Awaiting RSS feed configuration."),
         originalPostUrl: isHoliday ? originalPostUrl : "",
         announcedAt: isHoliday ? announcedAt : "",
         lastChecked: now.toISOString(),
         hasConfiguredFeed: !!rssUrl
     };
  }

  fs.writeFileSync(statusPath, JSON.stringify(currentStatus, null, 2));
  console.log("Updated public/status.json with 14 districts.");
}

checkHolidays();
