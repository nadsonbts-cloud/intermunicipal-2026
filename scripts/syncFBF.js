require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Baixando dados oficiais da FBF...");
  const response = await axios.get('https://www.fbf.org.br/competicoes/8', {
    headers: {
       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = response.data;
  const $ = cheerio.load(html);

  console.log("Extraindo Equipes (Classificação)...");
  const fbfTeams = [];

  $('.section-title-table').each((i, el) => {
    const table = $(el).next('table');
    table.find('tbody tr').each((j, tr) => {
      const tds = $(tr).find('td');
      const name = $(tds[0]).find('.team-meta__place').text().trim();
      const imgPath = $(tds[0]).find('img').attr('src');
      const escudoUrl = imgPath ? 'https://www.fbf.org.br' + imgPath : null;

      fbfTeams.push({ name, escudoUrl });
    });
  });

  console.log(`Extraídas ${fbfTeams.length} equipes do site.`);

  // 1. Atualizar escudos no BD
  const { data: dbEquipes, error: e1 } = await supabase.from('equipes').select('id, nome, grupo');
  if(e1) console.error(e1);

  let equipesAtualizadas = 0;
  for (const dbTeam of dbEquipes) {
    const fbfMatch = fbfTeams.find(t => t.name.toLowerCase() === dbTeam.nome.toLowerCase() || dbTeam.nome.toLowerCase().includes(t.name.toLowerCase()));
    if (fbfMatch && fbfMatch.escudoUrl) {
      await supabase.from('equipes').update({ escudoUrl: fbfMatch.escudoUrl }).eq('id', dbTeam.id);
      equipesAtualizadas++;
    }
  }
  console.log(`✅ ${equipesAtualizadas} escudos de equipes atualizados!`);

  // 2. Extrair Partidas e Datas
  console.log("Extraindo confrontos e datas...");
  const scrapedMatches = [];
  $('.data-hora-card-jogo').each((i, el) => {
    const htmlData = $(el).find('span').html() || '';
    const parts = htmlData.split('<br>');
    if (parts.length >= 2) {
      const city = parts[0].trim();
      const dateTime = parts[1].trim();

      const confronto = $(el).parent().find('.flex-confronto-card');
      const spans = confronto.find('.time-confronto');
      if (spans.length >= 2) {
        const mandanteAcr = $(spans[0]).text().trim().toLowerCase();
        const visitanteAcr = $(spans[1]).text().trim().toLowerCase();
        scrapedMatches.push({ city, dateTime, mandanteAcr, visitanteAcr });
      }
    }
  });

  console.log(`Extraídos ${scrapedMatches.length} cartões de confronto.`);

  // 3. Atualizar partidas no BD
  const { data: dbPartidas, error: e2 } = await supabase.from('partidas').select('id, mandante_id, visitante_id').eq('fase', 1);
  if (e2) console.error(e2);

  let partidasAtualizadas = 0;
  for (const match of dbPartidas) {
    const mandanteDb = dbEquipes.find(e => e.id === match.mandante_id);
    const visitanteDb = dbEquipes.find(e => e.id === match.visitante_id);

    if (mandanteDb && visitanteDb) {
      // Find the scraped match that most likely corresponds to this game
      // Checking if the acronym is contained in the real name (or vice versa)
      const scraped = scrapedMatches.find(sm => {
        // Tenta achar iniciais ou partes do nome
        const mOk = mandanteDb.nome.toLowerCase().startsWith(sm.mandanteAcr.substring(0,3)) || mandanteDb.nome.toLowerCase().includes(sm.mandanteAcr);
        const vOk = visitanteDb.nome.toLowerCase().startsWith(sm.visitanteAcr.substring(0,3)) || visitanteDb.nome.toLowerCase().includes(sm.visitanteAcr);
        return mOk && vOk;
      });

      if (scraped) {
        await supabase.from('partidas').update({
          data: scraped.dateTime,
          cidade: scraped.city
        }).eq('id', match.id);
        partidasAtualizadas++;
      } else {
         console.log(`⚠️ Não foi possível encontrar a data exata para: ${mandanteDb.nome} x ${visitanteDb.nome}`);
      }
    }
  }

  console.log(`✅ ${partidasAtualizadas} partidas atualizadas com Data, Hora e Cidade!`);
  console.log("Sincronização FBF concluída com sucesso.");
}

run().catch(console.error);
