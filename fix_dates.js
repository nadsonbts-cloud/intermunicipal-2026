require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

async function fixDates() {
  const lines = fs.readFileSync('pdf_data.txt', 'utf8').split('\n').filter(l => l.trim().length > 0);
  
  const { data: dbEquipes } = await supabase.from('equipes').select('*');
  const { data: dbPartidas } = await supabase.from('partidas').select('*').eq('fase', 1);
  
  let atualizadas = 0;
  
  for (const line of lines) {
    const match = line.match(/^(\d{2,3})\s+(\d{2}\/\d{2}\/\d{2})\s+(\S+)\s+(\d{2}:\d{2})\s+(\d{2})\s+(.*?)\s+(\dx\d|x)\s+(.*)$/);
    if (!match) continue;

    const [ _, jogoNum, dateStr, dayOfWeek, time, group, mandanteStr, score, visitanteAndCity ] = match;
    
    // Converte 16/08/26 para 16/08/2026
    const dateParts = dateStr.split('/');
    const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
    const dataHora = `${dateParts[0]}/${dateParts[1]}/${year} ${time}`;

    let mStr = mandanteStr.replace('Cabaceiras de Paraguau', 'Cabaceiras do Paraguaçu')
                         .replace('Santa Cruz das Vitria', 'Santa Cruz da Vitória')
                         .replace('Coarac', 'Coaraci')
                         .replace('Brejes', 'Brejões')
                         .trim();
                         
    const mandante = dbEquipes.find(e => removeAccents(e.nome) === removeAccents(mStr) || removeAccents(e.nome).includes(removeAccents(mStr)));
    
    if (!mandante) {
      console.log("Não achou mandante:", mStr);
      continue;
    }

    let vStr = visitanteAndCity.replace('Cabaceiras de Paraguau', 'Cabaceiras do Paraguaçu')
                               .replace('Santa Cruz das Vitria', 'Santa Cruz da Vitória')
                               .replace('Coarac', 'Coaraci')
                               .replace('Brejes', 'Brejões')
                               .trim();
                               
    let visitante = null;
    let city = '';
    
    // Sort descending by name length
    const sortedEquipes = [...dbEquipes].sort((a,b) => b.nome.length - a.nome.length);
    for (const eq of sortedEquipes) {
      if (removeAccents(vStr).startsWith(removeAccents(eq.nome))) {
        visitante = eq;
        city = vStr.substring(eq.nome.length).trim();
        break;
      }
    }
    
    if (!visitante) {
      console.log("Não achou visitante:", vStr);
      continue;
    }
    if (!city) city = visitante.nome;

    const dbMatch = dbPartidas.find(p => p.mandante_id === mandante.id && p.visitante_id === visitante.id);
    if (dbMatch) {
       const res = await supabase.from('partidas').update({ data: dataHora, cidade: city }).eq('id', dbMatch.id);
       if (res.error) console.error(res.error);
       atualizadas++;
    } else {
       console.log("Não achou partida no BD:", mandante.nome, visitante.nome);
    }
  }
  
  console.log(`Finalizado! ${atualizadas} partidas corrigidas.`);
}
fixDates();
