require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('partidas').select('id, rodada, mandante_id, visitante_id').eq('fase', 1);
  console.log("Total partidas na Fase 1 no DB:", data.length);
}
check();
