require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('partidas').update({ data: '15/08/2026 15:00' }).eq('id', 'MATCH_qqpoc60is');
  console.log("Error:", error);
  console.log("Data:", data);
}
check();
