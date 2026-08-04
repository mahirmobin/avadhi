const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

const KEYWORDS = ['അവധി', 'avadi', 'holiday', 'educational institutions', 'വിദ്യാഭ്യാസ', 'സ്ഥാപനങ്ങൾക്ക്', 'schools', 'colleges', 'anganwadi', 'tuition', 'professional colleges'];
const NEGATIVE_WORDS = ['അവധി ഇല്ല', 'മാറ്റമില്ല', 'വ്യാജം', 'മാറ്റിയിട്ടില്ല', 'no holiday', 'പ്രവൃത്തിദിനം', 'working day', 'regular class'];

const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

async function checkDistrict(code, url) {
    let out = `\n\n--- Debugging ${code} ---\n`;
    try {
        const feed = await parser.parseURL(url);
        const items = feed.items || [];
        items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        for (const item of items) {
          const pubDate = new Date(item.pubDate);
          const now = new Date();
          const diffHour = (now - pubDate) / (1000 * 60 * 60);
          
          out += `\nItem: ${item.title}\n`;
          out += `Time diff (hours): ${diffHour}\n`;
          
          if ((now - pubDate) > FORTY_EIGHT_HOURS) {
              out += "SKIPPED: > 48 HOURS\n";
              continue;
          }

          const rawText = (item.title + ' ' + (item.contentSnippet || '') + ' ' + (item.content || '')).toLowerCase();
          const containsKeyword = KEYWORDS.some(kw => rawText.includes(kw.toLowerCase()));
          const isFalsePositive = NEGATIVE_WORDS.some(kw => rawText.includes(kw));

          out += `Matched Keyword: ${containsKeyword}\n`;
          if (containsKeyword) {
              const matchedKw = KEYWORDS.filter(kw => rawText.includes(kw.toLowerCase()));
              out += `Specific Keywords Matched: ${matchedKw.join(", ")}\n`;
          }
          out += `Is False Positive: ${isFalsePositive}\n`;
        }
        
        fs.writeFileSync(`debug-${code}-out.txt`, out, 'utf8');
        console.log(`Saved debug-${code}-out.txt`);
    } catch (e) {
        console.error(`Error on ${code}:`, e.message);
    }
}

(async () => {
    await checkDistrict('MPM', 'https://fetchrss.com/feed/1wrG9qGFK7HQ1wrGEI3sV2AV.rss');
    await checkDistrict('KNR', 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDnTBs81wq.rss');
})();
