const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

(async () => {
    try {
        const feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDrl4k98DS.rss';
        const feed = await parser.parseURL(feedUrl);
        const item = feed.items[2];
        
        fs.writeFileSync('kkd-content.txt', item.content || 'NO_CONTENT', 'utf8');
        console.log("Wrote item.content to kkd-content.txt");
    } catch (e) {
        console.error(e);
    }
})();
