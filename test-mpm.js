const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

const NEGATIVE_WORDS = ['അവധി ഇല്ല', 'മാറ്റമില്ല', 'വ്യാജം', 'മാറ്റിയിട്ടില്ല', 'no holiday', 'പ്രവൃത്തിദിനം', 'working day', 'regular class'];

(async () => {
    try {
        const feedUrl = 'https://fetchrss.com/feed/1wrG9qGFK7HQ1wrGEI3sV2AV.rss';
        const feed = await parser.parseURL(feedUrl);
        const item = feed.items[2]; // The holiday item
        const rawText = (item.title + ' ' + (item.contentSnippet || '') + ' ' + (item.content || '')).toLowerCase();
        
        let out = "Found False Positives:\n";
        NEGATIVE_WORDS.forEach(kw => {
             if (rawText.includes(kw)) out += `- ${kw}\n`;
        });
        out += "\nRAW TEXT DUMP:\n" + rawText;
        fs.writeFileSync("test-mpm.txt", out, "utf8");
    } catch (e) {
        console.error(e);
    }
})();
