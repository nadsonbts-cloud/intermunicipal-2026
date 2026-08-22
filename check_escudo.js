require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('equipes').select('*').not('escudo_url', 'is', null).limit(10);
  console.log("DATA COM ESCUDOS:", data.length);
}
check();
