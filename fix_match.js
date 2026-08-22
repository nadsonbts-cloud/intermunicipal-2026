require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: dbEquipes } = await supabase.from('equipes').select('*');
  const mandante = dbEquipes.find(e => e.nome === 'Jaguaquara');
  const visitante = dbEquipes.find(e => e.nome === 'Itiruçu');
  
  if (mandante && visitante) {
      await supabase.from('partidas').update({
        data: '06/09/2026 15:00',
        cidade: 'Jaguaquara'
      }).match({ mandante_id: mandante.id, visitante_id: visitante.id });
      console.log('Match fixed!');
  }
}
check();
