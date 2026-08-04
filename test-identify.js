const Parser = require('rss-parser');
const fs = require('fs');
const parser = new Parser();

const urls = [
  'https://fetchrss.com/feed/1wrDn5GME8GZ1wrEIZAdkE4b.rss',
  'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDxkGs996g.rss',
  'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDrl4k98DS.rss',
  'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDp37eWD0H.rss',
  'https://fetchrss.com/feed/1wrDn5GME8GZ1wrDnTBs81wq.rss'
];

async function check() {
  let out = '';
  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      out += `URL: ${url}\nTITLE: ${feed.title}\n`;
      for (let i = 0; i < Math.min(3, feed.items.length); i++) {
        out += `ITEM ${i+1}: ${feed.items[i].contentSnippet?.substring(0, 100).replace(/\n/g, '')}...\n`;
      }
      out += '---\n';
    } catch (e) {
      out += `Error for ${url}: ${e.message}\n---\n`;
    }
  }
  fs.writeFileSync('identify-out.txt', out);
}

check();
