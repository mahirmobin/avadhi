const Parser = require('rss-parser');
const parser = new Parser();

async function testFetch() {
  const feeds = [
    'https://malayalam.asianetnews.com/rss/kerala',
    'https://zeenews.india.com/malayalam/kerala/feed',
    'https://malayalam.oneindia.com/rss/kerala-fb.xml',
    'https://news.google.com/rss/search?q=%E0%B4%B8%E0%B4%82%E0%B4%B8%E0%B5%8D%E0%B4%A5%E0%B4%BE%E0%B4%A8%E0%B4%A4%E0%B5%8D%E0%B4%A4%E0%B5%8D%20%E0%B4%85%E0%B4%B5%E0%B4%A7%E0%B4%BF%20alert&hl=ml&gl=IN&ceid=IN:ml' // സംസ്ഥാനത്ത് അവധി alert (State holiday alert)
  ];

  for (const feedUrl of feeds) {
    try {
      console.log(`\nFetching: ${feedUrl}`);
      let feed = await parser.parseURL(feedUrl);
      let count = 0;
      for (const item of feed.items) {
        if (/അവധി|അലർട്ട്|മഴ|holiday/i.test(item.title) || /അവധി|അലർട്ട്|മഴ|holiday/i.test(item.contentSnippet)) {
           console.log(`- [${item.pubDate}] ${item.title}`);
           console.log(`  Snippet: ${item.contentSnippet?.replace(/\n/g, ' ')}`);
           count++;
           if (count > 3) break;
        }
      }
    } catch (e) {
      console.log(`Error fetching ${feedUrl}: ${e.message}`);
    }
  }
}

testFetch();
