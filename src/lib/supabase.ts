import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// Cria o cliente Supabase. 
// Nota: Como estamos provendo credenciais mock caso não existam no .env,
// as chamadas de API reais vão falhar. O painel admin tratará este mock localmente
// para fins de demonstração da interface até que as variáveis reais sejam inseridas.
export const supabase = createClient(supabaseUrl, supabaseKey);
