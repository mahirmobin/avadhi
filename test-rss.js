const DISTRICTS = [
  { code: 'TVM', ml: ['തിരുവനന്തപുര'] },
  { code: 'KLM', ml: ['കൊല്ല'] },
  { code: 'PTA', ml: ['പത്തനംതിട്ട'] },
  { code: 'ALP', ml: ['ആലപ്പുഴ'] },
  { code: 'KTM', ml: ['കോട്ടയ'] },
  { code: 'IDK', ml: ['ഇടുക്കി'] },
  { code: 'EKM', ml: ['എറണാകുള'] },
  { code: 'TSR', ml: ['തൃശൂ', 'തൃശ്ശൂ'] },
  { code: 'PKD', ml: ['പാലക്കാട'] },
  { code: 'MPM', ml: ['മലപ്പുറ'] },
  { code: 'KKD', ml: ['കോഴിക്കോട'] },
  { code: 'WYD', ml: ['വയനാട'] },
  { code: 'KNR', ml: ['കണ്ണൂ'] },
  { code: 'KSG', ml: ['കാസർഗോ', 'കാസർകോ', 'കാസറഗോ', 'കാസ‍ർകോ'] }
];

async function checkHolidays() {
  try {
    const response = await fetch('https://news.google.com/rss/search?q=%E0%B4%85%E0%B4%B5%E0%B4%A7%E0%B4%BF+when:1d&hl=ml&gl=IN&ceid=IN:ml');
    const xml = await response.text();
    
    // Extract titles
    const titles = [];
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      titles.push(match[1]);
    }
    
    console.log(`Found ${titles.length} news items about 'അവധി'`);
    // Check which districts are mentioned
    for (const district of DISTRICTS) {
      let found = false;
      for (const title of titles) {
        for (const ml of district.ml) {
          if (title.includes(ml)) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      console.log(`${district.code}: ${found ? 'HOLIDAY' : 'No'}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkHolidays();
