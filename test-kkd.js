const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
    try {
        const feed = await parser.parseURL('https://fetchrss.com/feed/1wrDn5GME8GZ1wrDrl4k98DS.rss');
        console.log(`Feed Title: ${feed.title}`);
        feed.items.slice(0, 3).forEach(item => {
            console.log(`\n-- Item PubDate: ${item.pubDate} --`);
            console.log(`Title: ${item.title}`);
            console.log(`ContentSnippet: ${(item.contentSnippet || "").substring(0, 200)}...`);
            
            const rawText = (item.title + ' ' + (item.contentSnippet || '')).toLowerCase();
            const keywords = ['അവധി', 'avadi', 'holiday', 'educational institutions', 'വിദ്യാഭ്യാസ'];
            
            keywords.forEach(kw => {
                if (rawText.includes(kw)) {
                    console.log(`>>> MATCHED KEYWORD: ${kw}`);
                }
            });
        });
    } catch (e) {
        console.error(e);
    }
})();
