const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

(async () => {
    try {
        const feed = await parser.parseURL('https://fetchrss.com/feed/1wrDn5GME8GZ1wrDrl4k98DS.rss');
        const output = feed.items.slice(0, 3).map(i => ({
            title: i.title,
            snippet: i.contentSnippet,
            date: i.pubDate
        }));
        fs.writeFileSync('kkd-raw.json', JSON.stringify(output, null, 2));
        console.log("Wrote exact payload to kkd-raw.json");
    } catch (e) {
        console.error(e);
    }
})();
