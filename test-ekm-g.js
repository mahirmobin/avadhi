const Parser = require('rss-parser');
const parser = new Parser();

const MALAYALAM_HOLIDAY_KEYWORDS = ['അവധി', 'സ്ഥാപനങ്ങൾക്ക്', 'വിദ്യാഭ്യാസ സ്ഥാപനങ്ങൾക്ക് അവധി', 'school holiday', 'schools closed', 'holiday declared'];
const NEGATIVE_WORDS = ['അവധി ഇല്ല', 'വ്യാജം', 'no holiday', 'പ്രവൃത്തിദിനം', 'working day', 'regular class'];

(async () => {
    try {
        const baseQuery = `"എറണാകുളം" ("അവധി" OR "holiday")`;
        const targetUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(baseQuery)}&hl=ml&gl=IN&ceid=IN:ml`;
        
        console.log("Fetching: " + targetUrl);
        const feed = await parser.parseURL(targetUrl);
        
        console.log("Found " + feed.items.length + " Google News items.");
        for (let i = 0; i < 3; i++) {
           if (feed.items[i]) {
               console.log(`[${i}] ${feed.items[i].title} - ${feed.items[i].pubDate}`);
               console.log(feed.items[i].link);
           }
        }
    } catch(e) { console.error(e); }
})();
