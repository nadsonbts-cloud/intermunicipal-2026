require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

async function fixScores() {
  const lines = fs.readFileSync('pdf_data.txt', 'utf8').split('\n').filter(l => l.trim().length > 0);
  
  const { data: dbEquipes } = await supabase.from('equipes').select('*');
  const { data: dbPartidas } = await supabase.from('partidas').select('*').eq('fase', 1);
  
  let atualizadas = 0;
  
  for (const line of lines) {
    const match = line.match(/^(\d{2,3})\s+(\d{2}\/\d{2}\/\d{2})\s+(\S+)\s+(\d{2}:\d{2})\s+(\d{2})\s+(.*?)\s+(\dx\d|x)\s+(.*)$/);
    if (!match) continue;

    const [ _, jogoNum, dateStr, dayOfWeek, time, group, mandanteStr, score, visitanteAndCity ] = match;
    
    // Se o placar não tem 'x' ou é apenas 'x', ignoramos
    if (score === 'x' || !score.includes('x')) continue;

    const [golsMandanteStr, golsVisitanteStr] = score.split('x');
    const golsMandante = parseInt(golsMandanteStr, 10);
    const golsVisitante = parseInt(golsVisitanteStr, 10);

    if (isNaN(golsMandante) || isNaN(golsVisitante)) continue;

    let mStr = mandanteStr.replace('Cabaceiras de Paraguau', 'Cabaceiras do Paraguaçu')
                         .replace('Santa Cruz das Vitria', 'Santa Cruz da Vitória')
                         .replace('Coarac', 'Coaraci')
                         .replace('Brejes', 'Brejões')
                         .trim();
                         
    const mandante = dbEquipes.find(e => removeAccents(e.nome) === removeAccents(mStr) || removeAccents(e.nome).includes(removeAccents(mStr)));
    
    if (!mandante) continue;

    let vStr = visitanteAndCity.replace('Cabaceiras de Paraguau', 'Cabaceiras do Paraguaçu')
                               .replace('Santa Cruz das Vitria', 'Santa Cruz da Vitória')
                               .replace('Coarac', 'Coaraci')
                               .replace('Brejes', 'Brejões')
                               .trim();
                               
    let visitante = null;
    
    const sortedEquipes = [...dbEquipes].sort((a,b) => b.nome.length - a.nome.length);
    for (const eq of sortedEquipes) {
      if (removeAccents(vStr).startsWith(removeAccents(eq.nome))) {
        visitante = eq;
        break;
      }
    }
    
    if (!visitante) continue;

    const dbMatch = dbPartidas.find(p => p.mandante_id === mandante.id && p.visitante_id === visitante.id);
    if (dbMatch) {
       const res = await supabase.from('partidas').update({ 
         gols_mandante: golsMandante,
         gols_visitante: golsVisitante,
         status: 'FINALIZADO'
       }).eq('id', dbMatch.id);
       
       if (res.error) console.error(res.error);
       atualizadas++;
    }
  }
  
  console.log(`Finalizado! ${atualizadas} placares corrigidos.`);
}
fixScores();
