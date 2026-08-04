const fs = require('fs');
fetch('https://news.google.com/rss/search?q=%E0%B4%85%E0%B4%B5%E0%B4%A7%E0%B4%BF+when:1d&hl=ml&gl=IN&ceid=IN:ml')
  .then(res => res.text())
  .then(text => {
    let titles = [];
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      titles.push(match[1]);
    }
    fs.writeFileSync('titles.txt', titles.join('\n'));
    console.log('Saved ' + titles.length + ' titles to titles.txt');
  });
