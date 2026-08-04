const fs = require('fs');
const NEGATIVE_WORDS = ['ഇല്ല', 'മാറ്റമില്ല', 'വ്യാജം', 'ബാധകമല്ല', 'മാറ്റിയിട്ടില്ല', 'no holiday', 'പ്രവൃത്തിദിനം', 'working day', 'regular class'];
const text = "വിദ്യാഭ്യാസ സ്ഥാപനങ്ങൾക്ക് അവധി\n\n(Feed generated with FetchRSS)".toLowerCase();
let out = "Testing text: " + text + "\n";
NEGATIVE_WORDS.forEach(kw => {
    if (text.includes(kw)) {
         out += "MATCHED NEGATIVE WORD: " + kw + "\n";
    }
});
fs.writeFileSync('test-negative.txt', out, 'utf8');
