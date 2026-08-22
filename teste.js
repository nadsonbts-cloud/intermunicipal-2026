const fs = require('fs');
const cheerio = require('cheerio');
const c = fs.readFileSync('C:/Users/nadso/.gemini/antigravity/brain/6ba3f925-3a7d-442d-9dfe-ea1afa8e94ad/.system_generated/steps/1027/content.md', 'utf8');
const $ = cheerio.load(c);

$('.data-hora-card-jogo').slice(0,2).each((i, el) => {
    console.log($(el).parent().html());
    console.log("=========================================");
});
