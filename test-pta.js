const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

const NEGATIVE_WORDS = ['അവധി ഇല്ല', 'വ്യാജം', 'no holiday', 'പ്രവൃത്തിദിനം', 'working day', 'regular class'];

(async () => {
    try {
        const feedUrl = 'https://fetchrss.com/feed/1wrFim68t9PY1wrFp3FcL1MS.rss';
        const feed = await parser.parseURL(feedUrl);
        const item = feed.items[0]; // latest item
        const rawText = (item.title + ' ' + (item.contentSnippet || '') + ' ' + (item.content || '')).toLowerCase();
        
        let out = "Found False Positives:\n";
        NEGATIVE_WORDS.forEach(kw => {
             if (rawText.includes(kw)) out += `- ${kw}\n`;
        });
        out += "\nRAW TEXT DUMP PTA:\n" + rawText;
        fs.writeFileSync("test-pta.txt", out, "utf8");
    } catch (e) {
        console.error(e);
    }
})();
