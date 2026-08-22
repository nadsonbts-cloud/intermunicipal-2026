require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: dbPartidas, error } = await supabase.from('partidas').select('id, data, rodada').order('rodada', { ascending: true }).limit(5);
  console.log(dbPartidas);
}
check();
