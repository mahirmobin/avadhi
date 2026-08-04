const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

(async () => {
    try {
        const feedUrl = 'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDnTBs81wq.rss';
        const feed = await parser.parseURL(feedUrl);
        
        let out = "--- ERNAKULAM RSS FEED DIAGNOSTICS ---\n";
        
        feed.items.slice(0, 3).forEach((item, index) => {
             out += `\nITEM [${index}]:\n`;
             out += `TITLE: ${item.title}\n`;
             out += `DATE: ${item.pubDate}\n`;
             out += `RAW CONTENT: ${item.content || item.contentSnippet}\n`;
        });

        fs.writeFileSync("test-ekm.txt", out, "utf8");
    } catch (e) {
        console.error("RSS Error:", e);
    }
})();
