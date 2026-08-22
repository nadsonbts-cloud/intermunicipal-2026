require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Normalize accents to help string matching
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function run() {
  const lines = fs.readFileSync('pdf_data.txt', 'utf8').split('\n').filter(l => l.trim().length > 0);

  const { data: dbEquipes, error: e1 } = await supabase.from('equipes').select('*');
  if (e1) throw e1;
  const { data: dbPartidas, error: e2 } = await supabase.from('partidas').select('*').eq('fase', 1);
  if (e2) throw e2;

  let partidasAtualizadas = 0;

  for (const line of lines) {
    const match = line.match(/^(\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+(\S+)\s+(\d{2}:\d{2})\s+(\d{2})\s+(.*?)\s+(\dx\d|x)\s+(.*)$/);
    if (!match) continue;

    const [ _, idStr, dateStr, day, time, group, mandanteStr, score, visitanteAndCity ] = match;
    
    // Convert 15/08/26 to 15/08/2026 or similar if needed. We'll store it exactly as DD/MM/YYYY HH:MM
    const dateParts = dateStr.split('/');
    const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
    const formattedDateTime = `${dateParts[0]}/${dateParts[1]}/${year} ${time}`;

    // Find mandante
    const mandante = dbEquipes.find(e => removeAccents(e.nome).toLowerCase() === removeAccents(mandanteStr).toLowerCase() || removeAccents(e.nome).toLowerCase().includes(removeAccents(mandanteStr).toLowerCase()));
    
    if (!mandante) {
       console.log(`❌ Não achei mandante para a linha: ${line}`);
       continue;
    }

    // Find visitante
    // The string is "Visitante City"
    // Let's iterate all teams to see which one starts the string
    let visitante = null;
    let city = '';
    
    // Sort by name length descending so we match the longest possible team name first
    const sortedEquipes = [...dbEquipes].sort((a,b) => b.nome.length - a.nome.length);
    for (const eq of sortedEquipes) {
      if (removeAccents(visitanteAndCity).toLowerCase().startsWith(removeAccents(eq.nome).toLowerCase())) {
        visitante = eq;
        // City is the remainder
        city = visitanteAndCity.substring(eq.nome.length).trim();
        break;
      }
    }

    if (!visitante) {
      console.log(`❌ Não achei visitante para: ${visitanteAndCity}`);
      continue;
    }

    if (!city) city = visitante.nome; // Se a cidade não estava lá, põe o nome do visitante como default

    // Find the match in DB
    const dbMatch = dbPartidas.find(p => p.mandante_id === mandante.id && p.visitante_id === visitante.id);
    
    if (dbMatch) {
       await supabase.from('partidas').update({
         data: formattedDateTime,
         cidade: city
       }).eq('id', dbMatch.id);
       partidasAtualizadas++;
       console.log(`✅ Atualizado: ${mandante.nome} x ${visitante.nome} -> ${formattedDateTime} em ${city}`);
    } else {
       console.log(`⚠️ Partida não encontrada no banco: ${mandante.nome} x ${visitante.nome}`);
    }
  }

  console.log(`\n🏆 ${partidasAtualizadas} partidas atualizadas com as datas do PDF!`);
}

run().catch(console.error);
