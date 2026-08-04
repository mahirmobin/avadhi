const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const RSS_URL = process.env.RSS_URL || 'https://rss.app/feeds/IyeTPYI1DNTvS0JW.xml';


const KEYWORDS = [
  'അവധി', 'avadi', 'holiday', 'educational institutions', 'വിദ്യാഭ്യാസ', 'സ്ഥാപനങ്ങൾക്ക്', 
  'schools', 'colleges', 'anganwadis', 'tuition', 'professional colleges'
];

async function checkHoliday() {
  if (!RSS_URL) {
     console.log("No RSS_URL provided. Exiting.");
     return;
  }

  const parser = new Parser();
  let feed;
  try {
     feed = await parser.parseURL(RSS_URL);
  } catch (err) {
     console.error("Failed to parse RSS:", err);
     process.exit(1);
  }

  const items = feed.items || [];
  if (items.length === 0) {
     console.log("No items found in RSS feed.");
     return;
  }
  
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  let isHoliday = false;
  let announcementText = "";
  let originalPostUrl = "";
  let announcedAt = "";

  const now = new Date();
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
  
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

  const statusPath = path.join(__dirname, '..', 'public', 'status.json');
  let existingStatus = {};
  if (fs.existsSync(statusPath)) {
      existingStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  }

  const newStatus = {
     isHoliday,
     announcementText: isHoliday ? announcementText : "No holiday announcement detected in the recent updates.",
     originalPostUrl: isHoliday ? originalPostUrl : "https://twitter.com/ernakulamdc",
     announcedAt: isHoliday ? announcedAt : "",
     lastChecked: new Date().toISOString()
  };

  const statusChanged = existingStatus.isHoliday !== newStatus.isHoliday || existingStatus.announcedAt !== newStatus.announcedAt;

  fs.writeFileSync(statusPath, JSON.stringify(newStatus, null, 2));
  console.log("Updated status.json", newStatus);


}

checkHoliday();
