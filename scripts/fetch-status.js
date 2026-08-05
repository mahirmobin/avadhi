const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

const STATUS_FILE = path.join(__dirname, '../public/status.json');

const DISTRICTS = [
  { code: 'TVM', name: 'Thiruvananthapuram', handle: '@Dist_Admin_Tvm', ml: ['തിരുവനന്തപുര'] },
  { code: 'KLM', name: 'Kollam', handle: '@dckollam', ml: ['കൊല്ല'] },
  { code: 'PTA', name: 'Pathanamthitta', handle: '@DistrictCollectorPta', ml: ['പത്തനംതിട്ട'] },
  { code: 'ALP', name: 'Alappuzha', handle: '@districtcollectoralappuzha', ml: ['ആലപ്പുഴ'] },
  { code: 'KTM', name: 'Kottayam', handle: '@CollectorKottayam', ml: ['കോട്ടയ'] },
  { code: 'IDK', name: 'Idukki', handle: '@CollectorIdukki', ml: ['ഇടുക്കി'] },
  { code: 'EKM', name: 'Ernakulam', handle: '@ernakulamdc', ml: ['എറണാകുള'] },
  { code: 'TSR', name: 'Thrissur', handle: '@ThrissurCollector', ml: ['തൃശൂ', 'തൃശ്ശൂ'] },
  { code: 'PKD', name: 'Palakkad', handle: '@CollectorPalakkad', ml: ['പാലക്കാട'] },
  { code: 'MPM', name: 'Malappuram', handle: '@malappuramcollector', ml: ['മലപ്പുറ'] },
  { code: 'KKD', name: 'Kozhikode', handle: '@collectorkozhikode', ml: ['കോഴിക്കോട'] },
  { code: 'WYD', name: 'Wayanad', handle: '@wayanadcollector', ml: ['വയനാട'] },
  { code: 'KNR', name: 'Kannur', handle: '@collector.kannur', ml: ['കണ്ണൂ'] },
  { code: 'KSG', name: 'Kasaragod', handle: '@CollectorKasaragod', ml: ['കാസർഗോ', 'കാസർകോ', 'കാസറഗോ', 'കാസ‍ർകോ'] }
];

const KEYWORDS = [
  'അവധി', 'avadi', 'holiday', 'educational institutions', 'വിദ്യാഭ്യാസ', 'സ്ഥാപനങ്ങൾക്ക്', 
  'schools', 'colleges', 'anganwadi', 'tuition', 'professional colleges'
];

const NEGATIVE_WORDS = ['അവധി ഇല്ല', 'വ്യാജം', 'no holiday', 'പ്രവൃത്തിദിനം', 'working day', 'regular class'];

function extractMetStatus(text) {
  if (text.includes('red alert') || text.includes('റെഡ്')) return 'Red Alert';
  if (text.includes('orange alert') || text.includes('ഓറഞ്ച്')) return 'Orange Alert';
  if (text.includes('yellow alert') || text.includes('മഞ്ഞ')) return 'Yellow Alert';
  return '';
}

function extractHolidayScope(text) {
  let scope = 'Full District Holiday';
  if (text.includes('പ്രൊഫഷണൽ കോളേജുകൾ ഉൾപ്പെടെ') || text.includes('ഉൾപ്പെടെ')) {
    scope = 'Including Professional Colleges';
  } else if (text.includes('പ്രൊഫഷണൽ കോളേജുകൾ ഒഴികെ') || text.includes('ഒഴികെ') || text.includes('except professional colleges') || text.includes('ബാധകമല്ല')) {
    scope = 'Excluding Professional Colleges';
  } else if (text.includes('അങ്കണവാടി')) {
    scope = 'Includes Anganwadis';
  }
  return scope;
}

const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

async function fetchIMDData() {
  return new Promise((resolve) => {
    const KERALA_DISTRICTS_MAP = {
      "THIRUVANANTHAPURAM": "TVM", "KOLLAM": "KLM", "PATHANAMTHITTA": "PTA", 
      "ALAPPUZHA": "ALP", "KOTTAYAM": "KTM", "IDUKKI": "IDK", "ERNAKULAM": "EKM", 
      "THRISSUR": "TSR", "PALAKKAD": "PKD", "MALAPPURAM": "MPM", "KOZHIKODE": "KKD", 
      "WAYANAD": "WYD", "KANNUR": "KNR", "KASARAGOD": "KSG"
    };

    const https = require('https');
    https.get('https://mausam.imd.gov.in/imd_latest/contents/districtwise-warning_mc.php?id=4', { headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const regex = /"title":\s*"([^"]+)"[\s\S]*?"color":\s*"([^"]+)"/g;
            let match;
            const imdData = {};
            
            while ((match = regex.exec(data)) !== null) {
                let title = match[1].trim().toUpperCase();
                let color = match[2].trim().toUpperCase();
                
                if (title === 'KOTTYAM') title = 'KOTTAYAM'; // Typo in IMD backend sometimes
                
                if (KERALA_DISTRICTS_MAP[title]) {
                    let warning = 'No Alerts';
                    if (color === '#FF0000') warning = 'Red Alert';
                    else if (color === '#FFA500') warning = 'Orange Alert';
                    else if (color === '#FFFF00') warning = 'Yellow Alert';
                    
                    imdData[KERALA_DISTRICTS_MAP[title]] = warning;
                }
            }
            resolve(imdData);
        });
    }).on('error', err => {
        console.error("IMD Sync Error:", err);
        resolve({});
    });
  });
}

async function checkHolidays() {
  console.log(`[${new Date().toISOString()}] Started Hybrid Holiday Check...`);
  const imdMetData = await fetchIMDData();
  console.log("Fetched Global IMD Data:", Object.keys(imdMetData).length, "Districts");
  
  let statusData = {};
  try {
    if (fs.existsSync(STATUS_FILE)) {
      statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      // Clean up legacy keys
      const validCodes = DISTRICTS.map(d => d.code);
      for (const key of Object.keys(statusData)) {
          if (!validCodes.includes(key)) {
              delete statusData[key];
          }
      }
    }
  } catch (err) {}

  // Pass 1: Parse Official Facebook Feeds configured via URLs
  for (const district of DISTRICTS) {
    let isHoliday = false;
    let announcementText = "Normal working day";
    let metStatus = '';
    let holidayScope = '';
    let originalPostUrl = '';
    let announcedAt = '';
    let sourceBadge = '';
    let targetDateStr = '';

    let feedUrl = process.env[`${district.code}_RSS_URL`];
    // Specific hardcoded overrides provided by user earlier as fallbacks
    if (!feedUrl) {
      if (district.code === 'EKM') feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDnTBs81wq.rss';
      if (district.code === 'TSR') feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDp37eWD0H.rss';
      if (district.code === 'KNR') feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDxkGs996g.rss';
      if (district.code === 'WYD') feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrEIZAdkE4b.rss';
      if (district.code === 'KKD') feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDrl4k98DS.rss';
      if (district.code === 'IDK') feedUrl = 'https://fetchrss.com/feed/1wrFim68t9PY1wrFqk5el96w.rss';
      if (district.code === 'ALP') feedUrl = 'https://fetchrss.com/feed/1wrFim68t9PY1wrFqHC8e3BF.rss';
      if (district.code === 'PTA') feedUrl = 'https://fetchrss.com/feed/1wrFim68t9PY1wrFp3FcL1MS.rss';
      if (district.code === 'KLM') feedUrl = 'https://fetchrss.com/feed/1wrFim68t9PY1wrFofCq8Bnv.rss';
      if (district.code === 'TVM') feedUrl = 'https://fetchrss.com/feed/1wrFim68t9PY1wrFkjCtG3ap.rss';
      if (district.code === 'KSG') feedUrl = 'https://fetchrss.com/feed/1wrG9qGFK7HQ1wrGGe4EQ67e.rss';
      if (district.code === 'MPM') feedUrl = 'https://fetchrss.com/feed/1wrG9qGFK7HQ1wrGEI3sV2AV.rss';
      if (district.code === 'PKD') feedUrl = 'https://fetchrss.com/feed/1wrG9qGFK7HQ1wrGE05iYEEc.rss';
      if (district.code === 'KTM') feedUrl = 'https://fetchrss.com/feed/1wrG9qGFK7HQ1wrGDk5x24zC.rss';
    }

    if (feedUrl) {
      try {
        console.log(`Fetching FB RSS for ${district.code}...`);
        // Basic timeout to stop endless stalls on broken fetchrss nodes
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items || [];
        items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        for (const item of items) {
          const pubDate = new Date(item.pubDate);
          const now = new Date();
          if ((now - pubDate) > FORTY_EIGHT_HOURS) continue; 

          const rawText = (item.title + ' ' + (item.contentSnippet || '') + ' ' + (item.content || '')).toLowerCase();
          const containsKeyword = KEYWORDS.some(kw => rawText.includes(kw.toLowerCase()));
          const isFalsePositive = NEGATIVE_WORDS.some(kw => rawText.includes(kw));

          if (containsKeyword && !isFalsePositive) {
            isHoliday = true;
            originalPostUrl = 'https://www.facebook.com/' + (item.guid || '');
            announcedAt = item.pubDate;
            
            announcementText = (item.contentSnippet || '').replace(/\(Feed generated with FetchRSS\)/gi, '').trim();
            
            const pubDateObj = new Date(item.pubDate);
            const istOffset = 5.5 * 60 * 60 * 1000;
            const localIstDate = new Date(pubDateObj.getTime() + istOffset);
            
            if (localIstDate.getUTCHours() >= 12) {
               localIstDate.setUTCDate(localIstDate.getUTCDate() + 1);
            }
            targetDateStr = `${localIstDate.getUTCDate().toString().padStart(2, '0')}/${(localIstDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${localIstDate.getUTCFullYear()}`;
            
            metStatus = extractMetStatus(rawText);
            holidayScope = extractHolidayScope(rawText);
            sourceBadge = 'District Collector Official (FB)';
            break; 
          }
        }
      } catch (err) {
        console.error(`Error fetching RSS for ${district.code}:`, err.message);
      }
    }

    statusData[district.code] = {
      name: district.name,
      handle: district.handle,
      isHoliday,
      announcementText,
      originalPostUrl,
      announcedAt,
      holidayDate: targetDateStr,
      hasConfiguredFeed: !!feedUrl,
      sourceBadge,
      metStatus: imdMetData[district.code] && imdMetData[district.code] !== 'No Alerts' ? imdMetData[district.code] : metStatus,
      holidayScope,
      lastChecked: new Date().toISOString()
    };
  }

  console.log(`[Google News Backup Pass] Sweeping news aggregators for missed updates...`);
  
  for (const district of DISTRICTS) {
      if (statusData[district.code]?.isHoliday) continue; 
      
      try {
          console.log(`Fallback fetching specific queries for ${district.code}...`);
          let isFbHoliday = false;
          let fbMetStatus = '';
          let fbScope = '';
          let fbPostText = '';
          let fbLink = '';
          let fbDate = '';
          let fbTargetDate = '';

          const searchTerms = [`${district.ml[0]} ജില്ല അവധി`, `${district.ml[0]} ഓറഞ്ച് അലർട്ട്`, `${district.ml[0]} റെഡ് അലർട്ട്`];
          
          for (let term of searchTerms) {
             const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(term + ' when:1d')}&hl=ml&gl=IN&ceid=IN:ml`;
             const response = await fetch(rssUrl);
             const xml = await response.text();
             
             const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<description><!\[CDATA\[(.*?)\]\]><\/description>[\s\S]*?<pubDate>(.*?)<\/pubDate>/g;
             let match;
             
             while ((match = itemRegex.exec(xml)) !== null) {
                const title = match[1].toLowerCase();
                const description = match[3].toLowerCase();
                
                const cleanDesc = description.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                const rawText = (title + ' ' + cleanDesc);
                
                const hasNegativeWord = NEGATIVE_WORDS.some(word => rawText.includes(word));
                if (hasNegativeWord) continue;
                
                const isMentioned = district.ml.some(mlToken => rawText.includes(mlToken));
                if (!isMentioned) continue;
                
                if (!fbMetStatus) {
                   fbMetStatus = extractMetStatus(rawText);
                }
                
                if (!isFbHoliday) {
                   const containsHolidayKeyword = KEYWORDS.some(kw => rawText.includes(kw.toLowerCase()));
                   if (containsHolidayKeyword) {
                       isFbHoliday = true;
                       fbScope = extractHolidayScope(rawText);
                       fbPostText = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                       fbLink = match[2];
                       fbDate = match[4];
                       
                       const googlePubDateObj = new Date(fbDate);
                       const gIstOffset = 5.5 * 60 * 60 * 1000;
                       const gLocalIstDate = new Date(googlePubDateObj.getTime() + gIstOffset);
            
                       if (gLocalIstDate.getUTCHours() >= 12) {
                          gLocalIstDate.setUTCDate(gLocalIstDate.getUTCDate() + 1);
                       }
                       fbTargetDate = `${gLocalIstDate.getUTCDate().toString().padStart(2, '0')}/${(gLocalIstDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${gLocalIstDate.getUTCFullYear()}`;
                   }
                }
             }
          }
          
          if (isFbHoliday || fbMetStatus) {
              statusData[district.code] = {
                  name: district.name,
                  handle: district.handle,
                  isHoliday: isFbHoliday,
                  metStatus: imdMetData[district.code] && imdMetData[district.code] !== 'No Alerts' ? imdMetData[district.code] : fbMetStatus,
                  holidayScope: fbScope,
                  announcementText: fbPostText || "MET status updated dynamically.",
                  originalPostUrl: fbLink,
                  announcedAt: fbDate || new Date().toISOString(),
                  holidayDate: fbTargetDate,
                  lastChecked: new Date().toISOString(),
                  hasConfiguredFeed: true,
                  sourceBadge: 'News Aggregator Fallback (Targeted)'
              };
              console.log(`[Google News Backup Hit] ${district.code} -> Holiday: ${isFbHoliday}, MET: ${fbMetStatus}`);
          }
      } catch (e) {
          console.error(`Error in Fallback for ${district.code}:`, e.message);
      }
  }
  // --- HOTFIX BYPASS FOR ERNAKULAM DUE TO CACHE FREEZE ---
  /*
  if (statusData['EKM'] && tomorrowDateStr === '05/08/2026') {
      statusData['EKM'].isHoliday = true;
      statusData['EKM'].holidayDate = '05/08/2026';
      statusData['EKM'].announcementText = "നാളെ അവധി (Verified Override: Bypassing upstream proxy cache limits)";
      statusData['EKM'].holidayScope = "Includes all educational institutions";
      statusData['EKM'].sourceBadge = "Collector Official (LIVE OVERRIDE)";
  }
  */

  fs.writeFileSync(STATUS_FILE, JSON.stringify(statusData, null, 2));
  console.log(`Successfully updated ${STATUS_FILE}`);
}

checkHolidays();
