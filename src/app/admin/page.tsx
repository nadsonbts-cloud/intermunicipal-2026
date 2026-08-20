'use client';
import { useState, useEffect } from 'react';
import { useCampeonatoStore } from '@/store/campeonatoStore';
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, Plus, Minus, Save, FileText, X, Users, Flag, Calendar } from 'lucide-react';
import EquipesCRUD from '@/components/admin/EquipesCRUD';
import JogadoresCRUD from '@/components/admin/JogadoresCRUD';
import SumulaModal from '@/components/admin/SumulaModal';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificando auth real (Supabase)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAuthenticated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      if (isRegistering) {
        // Fluxo de Cadastro Real
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          alert(error.message);
        } else {
          alert('Administrador cadastrado com sucesso! Verifique o e-mail ou faça login.');
          setIsRegistering(false);
        }
      } else {
        // Fluxo de Login Real
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
      }
    } else {
      // MOCK LOCAL PARA DEMONSTRAÇÃO
      if (isRegistering) {
         alert('ATENÇÃO: Você está no modo Demonstração (Sem Supabase conectado). Para cadastrar usuários reais, insira as chaves do Supabase no .env.local.');
      } else {
        if (email === 'admin@fbf.com.br' && password === 'admin') {
          setIsAuthenticated(true);
        } else {
          alert('Banco de dados não conectado. Para o mock local use: admin@fbf.com.br / admin');
        }
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.auth.signOut();
    } else {
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500/20 p-4 rounded-full text-emerald-500">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">{isRegistering ? 'Cadastrar Administrador' : 'Acesso Restrito'}</h1>
          <p className="text-center text-slate-400 mb-8 text-sm">
            {isRegistering ? 'Crie uma conta para operar o sistema.' : 'Painel oficial de controle de súmulas da FBF.'}
          </p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">E-mail</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Senha</label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
            >
              {loading ? 'Aguarde...' : (isRegistering ? 'Finalizar Cadastro' : 'Entrar no Painel')}
            </button>

            <div className="text-center mt-4 border-t border-slate-800 pt-4">
              <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-emerald-500 hover:text-emerald-400 font-bold"
              >
                {isRegistering ? 'Já tenho uma conta. Fazer Login.' : 'Não tem acesso? Cadastrar Administrador.'}
              </button>
            </div>

            {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
              <p className="text-xs text-yellow-500/70 text-center mt-4">Modo Demonstração: Use admin@fbf.com.br / admin</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

// Componente principal do Painel
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'partidas'|'equipes'|'jogadores'>('partidas');
  const { partidas, selecoes, atualizarPlacar } = useCampeonatoStore();
  const [faseFiltro, setFaseFiltro] = useState<number>(1);
  const [rodadaFiltro, setRodadaFiltro] = useState<number>(1);
  
  // Estado local para controle dos placares antes de salvar
  const [placaresAtuais, setPlacaresAtuais] = useState<Record<string, {gm: number, gv: number, status: any}>>({});
  const [salvando, setSalvando] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPartida, setModalPartida] = useState<any>(null);

  const partidasFiltradas = partidas.filter(p => p.fase === faseFiltro && p.rodada === rodadaFiltro);

  // Inicializa o estado local com os valores do global
  useEffect(() => {
    const iniciais: any = {};
    partidasFiltradas.forEach(p => {
      iniciais[p.id] = { gm: p.gols_mandante || 0, gv: p.gols_visitante || 0, status: p.status };
    });
    setPlacaresAtuais(iniciais);
  }, [partidasFiltradas]);

  const changeScore = (id: string, time: 'gm' | 'gv', sum: number) => {
    setPlacaresAtuais(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [time]: Math.max(0, prev[id][time] + sum)
      }
    }));
  };

  const changeStatus = (id: string, status: any) => {
    setPlacaresAtuais(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const salvarNoSupabase = async (id: string) => {
    setSalvando(id);
    const { gm, gv, status } = placaresAtuais[id];
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Dispara update real no banco
      await supabase.from('partidas').update({ gols_mandante: gm, gols_visitante: gv, status }).eq('id', id);
    }
    
    // Atualiza a Store (o que ativa a reatividade do Front no protótipo)
    atualizarPlacar(id, gm, gv, status);
    
    setTimeout(() => setSalvando(null), 1000); // Feedback visual
  };

  const abrirSumula = (jogo: any) => {
    setModalPartida(jogo);
    setModalOpen(true);
  };

  return (
    <div className="max-w-md mx-auto md:max-w-4xl pb-24">
      <header className="mb-6 flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Controle de Súmula</h1>
          <p className="text-xs text-slate-400">Tempo Real</p>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-white p-2">
          <LogOut size={20} />
        </button>
      </header>

      <div className="flex gap-2 mb-6 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button onClick={() => setActiveTab('partidas')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'partidas' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
          <Calendar size={16} /> Partidas
        </button>
        <button onClick={() => setActiveTab('equipes')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'equipes' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
          <Flag size={16} /> Equipes
        </button>
        <button onClick={() => setActiveTab('jogadores')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'jogadores' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
          <Users size={16} /> Jogadores
        </button>
      </div>

      {activeTab === 'equipes' && <EquipesCRUD />}
      {activeTab === 'jogadores' && <JogadoresCRUD />}
      
      {activeTab === 'partidas' && (
        <>
          <div className="flex gap-2 mb-6">
        <select 
          value={faseFiltro} onChange={(e) => setFaseFiltro(Number(e.target.value))}
          className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-3 text-sm focus:border-emerald-500 outline-none"
        >
          <option value={1}>Fase 1</option>
          <option value={2}>Fase 2</option>
        </select>
        <select 
          value={rodadaFiltro} onChange={(e) => setRodadaFiltro(Number(e.target.value))}
          className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg px-3 py-3 text-sm focus:border-emerald-500 outline-none"
        >
          {[1,2,3,4,5,6].map(r => <option key={r} value={r}>Rodada {r}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {partidasFiltradas.map(jogo => {
          const mandante = selecoes.find(s => s.id === jogo.mandante_id)!;
          const visitante = selecoes.find(s => s.id === jogo.visitante_id)!;
          const estadoCard = placaresAtuais[jogo.id];
          if (!estadoCard) return null;

          const salvoComSucesso = salvando === jogo.id;

          return (
            <div key={jogo.id} className={`bg-slate-900 border ${salvoComSucesso ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-800'} rounded-xl overflow-hidden transition-all`}>
              <div className="bg-slate-950 px-4 py-2 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">ID: {jogo.id.substring(6, 12)}</span>
                <span className="text-slate-500">{mandante.grupo}</span>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  {/* Mandante Control */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-white truncate w-20 text-center">{mandante.nome}</span>
                    <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700">
                      <button onClick={() => changeScore(jogo.id, 'gm', -1)} className="p-3 text-red-400 active:bg-slate-700 rounded-l-lg"><Minus size={18} /></button>
                      <span className="w-10 text-center font-mono text-xl font-bold text-white">{estadoCard.gm}</span>
                      <button onClick={() => changeScore(jogo.id, 'gm', 1)} className="p-3 text-emerald-400 active:bg-slate-700 rounded-r-lg"><Plus size={18} /></button>
                    </div>
                  </div>

                  <span className="text-slate-600 font-bold px-2">X</span>

                  {/* Visitante Control */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-white truncate w-20 text-center">{visitante.nome}</span>
                    <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700">
                      <button onClick={() => changeScore(jogo.id, 'gv', -1)} className="p-3 text-red-400 active:bg-slate-700 rounded-l-lg"><Minus size={18} /></button>
                      <span className="w-10 text-center font-mono text-xl font-bold text-white">{estadoCard.gv}</span>
                      <button onClick={() => changeScore(jogo.id, 'gv', 1)} className="p-3 text-emerald-400 active:bg-slate-700 rounded-r-lg"><Plus size={18} /></button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <select 
                    value={estadoCard.status}
                    onChange={(e) => changeStatus(jogo.id, e.target.value)}
                    className={`bg-slate-950 border ${estadoCard.status === 'AO_VIVO' ? 'border-emerald-500 text-emerald-500' : 'border-slate-800 text-slate-300'} rounded-lg px-2 py-3 text-xs font-bold uppercase focus:outline-none`}
                  >
                    <option value="AGENDADO">Agendado</option>
                    <option value="AO_VIVO">Ao Vivo</option>
                    <option value="FINALIZADO">Encerrado</option>
                  </select>
                  
                  <button 
                    onClick={() => salvarNoSupabase(jogo.id)}
                    className={`${salvoComSucesso ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'} rounded-lg py-3 flex items-center justify-center gap-2 font-bold text-sm transition-colors`}
                  >
                    <Save size={16} />
                    {salvoComSucesso ? 'Salvo!' : 'Atualizar'}
                  </button>
                </div>
                
                <button 
                  onClick={() => abrirSumula(jogo)}
                  className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg py-2 flex items-center justify-center gap-2 text-xs font-bold border border-slate-700"
                >
                  <FileText size={14} />
                  Súmula e Eventos
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Súmula */}
      {modalOpen && modalPartida && (
        <SumulaModal partida={modalPartida} onClose={() => setModalOpen(false)} />
      )}
        </>
      )}
    </div>
  );
}
