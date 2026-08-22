const fs = require('fs');
const cheerio = require('cheerio');
const c = fs.readFileSync('C:/Users/nadso/.gemini/antigravity/brain/6ba3f925-3a7d-442d-9dfe-ea1afa8e94ad/.system_generated/steps/1027/content.md', 'utf8');
const $ = cheerio.load(c);

const matchesScraped = [];

$('.data-hora-card-jogo').each((i, el) => {
    // text will likely have the city and date separated by br or newline
    // Let's use html() to split by <br> safely
    const htmlData = $(el).find('span').html() || '';
    const parts = htmlData.split('<br>');
    const city = parts[0] ? parts[0].trim() : '';
    const dateTime = parts[1] ? parts[1].trim() : '';

    const parent = $(el).parent(); // It looks like they are inside some container
    const confronto = parent.find('.flex-confronto-card');
    const spans = confronto.find('.time-confronto');
    
    if (spans.length >= 2) {
        const mandanteAcr = $(spans[0]).text().trim();
        const visitanteAcr = $(spans[1]).text().trim();
        matchesScraped.push({ city, dateTime, mandanteAcr, visitanteAcr });
    }
});

console.log(matchesScraped.slice(0, 5));
