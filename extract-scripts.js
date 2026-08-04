const fs = require('fs');

const html = fs.readFileSync('imd-page.html', 'utf8');
const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];

let out = "";
scripts.forEach((scr, i) => {
    out += `\n\n--- SCRIPT ${i} ---\n` + scr;
});

fs.writeFileSync('imd-scripts.txt', out);
console.log("Extracted " + scripts.length + " scripts to imd-scripts.txt");
