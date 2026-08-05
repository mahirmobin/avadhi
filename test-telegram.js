const fs = require('fs');

async function testTelegram() {
    let out = "--- TELEGRAM TESTS ---\n";
    const channels = ['twentyfournews', 'asianetnews', 'keralaprd'];

    for (let channel of channels) {
        try {
            console.log("Fetching " + channel);
            let res = await fetch(`https://t.me/s/${channel}`);
            let text = await res.text();
            
            // Extract the last 5 messages via regex
            const regex = /<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/g;
            let match;
            let count = 0;
            out += `\n=== CHANNEL: ${channel} ===\n`;
            
            let messages = [];
            while ((match = regex.exec(text)) !== null) {
                let msg = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                messages.push(msg);
            }
            
            out += messages.slice(-5).join("\n\n---\n\n");
            
        } catch(e) {
            console.error(e);
        }
    }
    
    fs.writeFileSync('test-telegram.txt', out);
    console.log("Done");
}

testTelegram();
