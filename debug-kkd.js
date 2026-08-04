const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');
const KEYWORDS = ['അവധി', 'avadi', 'holiday', 'educational institutions', 'വിദ്യാഭ്യാസ', 'സ്ഥാപനങ്ങൾക്ക്', 'schools', 'colleges', 'anganwadi', 'tuition', 'professional colleges'];
const NEGATIVE_WORDS = ['ഇല്ല', 'മാറ്റമില്ല', 'വ്യാജം', 'ബാധകമല്ല', 'മാറ്റിയിട്ടില്ല', 'no holiday', 'പ്രവൃത്തിദിനം', 'working day', 'regular class'];
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

(async () => {
    let out = "";
    try {
        const feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDrl4k98DS.rss';
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items || [];
        items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        for (const item of items) {
          const pubDate = new Date(item.pubDate);
          const now = new Date();
          out += `\nItem: ${item.title}\n`;
          out += `PubDate: ${pubDate}, Now: ${now}\n`;
          out += `Time diff (hours): ${(now - pubDate) / (1000 * 60 * 60)}\n`;
          
          if ((now - pubDate) > FORTY_EIGHT_HOURS) {
              out += "SKIPPED: ALREADY EXPIRED OVER 48 HOURS\n";
              continue;
          }

          const rawText = (item.title + ' ' + (item.contentSnippet || '') + ' ' + (item.content || '')).toLowerCase();
          const containsKeyword = KEYWORDS.some(kw => rawText.includes(kw.toLowerCase()));
          const isFalsePositive = NEGATIVE_WORDS.some(kw => rawText.includes(kw));

          out += `Contains Keyword: ${containsKeyword}, False Positive: ${isFalsePositive}\n`;
          if (containsKeyword && !isFalsePositive) {
            out += ">> SUCCESS: KKD Holiday Detected\n";
            break; 
          }
        }
        
        fs.writeFileSync("kkd-out.txt", out, "utf8");
    } catch (e) {
        console.error(e);
    }
})();
