require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const content = fs.readFileSync('C:/Users/nadso/.gemini/antigravity/brain/6ba3f925-3a7d-442d-9dfe-ea1afa8e94ad/.system_generated/steps/545/content.md', 'utf8');
  const $ = cheerio.load(content);

  const groups = [];

  $('.section-title-table').each((i, el) => {
    const groupName = $(el).find('h4').text().trim();
    const table = $(el).next('table');
    const teams = [];

    table.find('tbody tr').each((j, tr) => {
      const tds = $(tr).find('td');
      const name = $(tds[0]).find('.team-meta__place').text().trim();
      const points = parseInt($(tds[1]).text().trim(), 10);
      const played = parseInt($(tds[2]).text().trim(), 10);
      const wins = parseInt($(tds[3]).text().trim(), 10);
      const draws = parseInt($(tds[4]).text().trim(), 10);
      const losses = parseInt($(tds[5]).text().trim(), 10);
      const gf = parseInt($(tds[6]).text().trim(), 10);
      const ga = parseInt($(tds[7]).text().trim(), 10);

      teams.push({ name, points, played, wins, draws, losses, gf, ga });
    });

    groups.push({ groupName, teams });
  });

  console.log(`Found ${groups.length} groups.`);

  // Puxar as equipes e partidas do banco
  const { data: dbEquipes, error: e1 } = await supabase.from('equipes').select('id, nome, grupo');
  if(e1) console.error(e1);
  const { data: dbPartidas, error: e2 } = await supabase.from('partidas').select('id, mandante_id, visitante_id, rodada').eq('fase', 1).eq('rodada', 1);
  if(e2) console.error(e2);

  let matchUpdates = [];

  for (const group of groups) {
    if (group.teams.every(t => t.played === 0)) continue; // não teve jogo

    // Precisamos deduzir quem jogou com quem
    // Procuramos pelas partidas no BD
    const groupEquipes = dbEquipes.filter(e => e.grupo === 'GR-' + group.groupName.replace('Grupo ', '').padStart(2, '0'));
    
    // Tenta casar as equipes da FBF com as do BD
    for (const team of group.teams) {
       // match loosely
       const dbTeam = groupEquipes.find(e => e.nome.toLowerCase().includes(team.name.toLowerCase()) || team.name.toLowerCase().includes(e.nome.toLowerCase()));
       if(dbTeam) team.dbId = dbTeam.id;
    }

    const groupMatches = dbPartidas.filter(p => groupEquipes.some(e => e.id === p.mandante_id));

    // Deduzir os placares. Cada partida tem um mandante e visitante.
    for (const match of groupMatches) {
       const mandante = group.teams.find(t => t.dbId === match.mandante_id);
       const visitante = group.teams.find(t => t.dbId === match.visitante_id);

       if (mandante && visitante) {
          // Se Mandante fez X gols e tomou Y gols, e Visitante fez Y gols e tomou X gols...
          if (mandante.gf === visitante.ga && mandante.ga === visitante.gf) {
             matchUpdates.push({
               id: match.id,
               gols_mandante: mandante.gf,
               gols_visitante: visitante.gf,
               status: 'FINALIZADO'
             });
             console.log(`${mandante.name} ${mandante.gf} x ${visitante.gf} ${visitante.name}`);
          } else {
             // Caso não seja um casamento perfeito (ex: times jogaram mais de 1 jogo?), vamos usar o GP
             console.log(`Mismatch ou Múltiplos Jogos para: ${mandante.name} x ${visitante.name}`);
          }
       }
    }
  }

  console.log(`Prestes a atualizar ${matchUpdates.length} partidas no Supabase...`);
  
  for (const update of matchUpdates) {
     const { error } = await supabase.from('partidas').update({
        gols_mandante: update.gols_mandante,
        gols_visitante: update.gols_visitante,
        status: update.status
     }).eq('id', update.id);
     
     if(error) console.error("Erro ao atualizar", update.id, error);
  }

  console.log("Sucesso! Banco sincronizado com a FBF.");
}

run().catch(console.error);
