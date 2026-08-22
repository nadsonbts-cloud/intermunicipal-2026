const fs = require('fs');
const lines = fs.readFileSync('pdf_data.txt', 'utf8').split('\n').filter(l => l.trim().length > 0);

for (const line of lines) {
  // Regex to match: ID DATE DAY TIME GROUP ...
  const match = line.match(/^(\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+(\S+)\s+(\d{2}:\d{2})\s+(\d{2})\s+(.*?)\s+(\dx\d|x)\s+(.*)$/);
  if (match) {
    const [ _, id, date, day, time, group, mandante, score, visitanteAndCity ] = match;
    console.log(`M: ${mandante} | V+C: ${visitanteAndCity}`);
  } else {
    console.log("NO MATCH:", line);
  }
}
