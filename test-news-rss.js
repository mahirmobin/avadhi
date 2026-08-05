const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');

async function testNewsRSS() {
    let out = "--- MALAYALAM RSS TESTS ---\n";
    
    // Core feeds for educational updates in Kerala
    const feeds = [
        'https://malayalam.news18.com/rss/kerala.xml', 
        'https://keralakaumudi.com/rss/rssFeed.php',
        'https://malayalam.samayam.com/rssfeeds/61580252.cms', 
        'https://www.janmabhumi.in/feed'
    ];

    for (let feedUrl of feeds) {
        try {
            console.log("Fetching " + feedUrl);
            let feed = await parser.parseURL(feedUrl);
            
            out += `\n=== SOURCE: ${feed.title || feedUrl} ===\n`;
            
            // Look specifically for 'അവധി' (holiday) to verify breaking news availability
            feed.items.forEach(item => {
                if (item.title.includes('അവധി')) {
                   out += `\n>> FOUND HOLIDAY MATCH <<\nTITLE: ${item.title}\nDATE: ${item.pubDate}\n\n`;
                }
            });
            
            // Dump the first 3 general titles to verify feed consistency
            out += "\nGeneral Payload Sample:\n";
            feed.items.slice(0, 3).forEach((item, index) => {
                 out += `[${index}] ${item.title}\n`;
            });
            
        } catch(e) {
            console.error(`Error on ${feedUrl}:`, e.message);
        }
    }
    
    fs.writeFileSync('test-rss.txt', out);
    console.log("Done");
}

testNewsRSS();
