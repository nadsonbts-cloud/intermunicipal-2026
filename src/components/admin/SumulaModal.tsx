import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, X, Plus, Trash2 } from 'lucide-react';

export default function SumulaModal({ partida, onClose }: { partida: any, onClose: () => void }) {
  const [jogadores, setJogadores] = useState<any[]>([]);
  const [golsRegistrados, setGolsRegistrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [jogadorSelecionado, setJogadorSelecionado] = useState('');
  const [minuto, setMinuto] = useState('');
  const [tipo, setTipo] = useState('NORMAL');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    // Buscar jogadores dos dois times
    const { data: jData } = await supabase
      .from('jogadores')
      .select('id, nome, equipe_id, equipes(nome)')
      .in('equipe_id', [partida.selecaoMandanteId, partida.selecaoVisitanteId]);
    if (jData) setJogadores(jData);

    // Buscar gols já registrados nesta partida
    const { data: gData } = await supabase
      .from('gols')
      .select('id, minuto, tipo, jogador_id, jogadores(nome, equipes(nome))')
      .eq('partida_id', partida.id);
    if (gData) setGolsRegistrados(gData);

    setLoading(false);
  };

  const registrarGol = async () => {
    if (!jogadorSelecionado || !minuto) return alert('Preencha jogador e minuto.');
    setSalvando(true);
    try {
      await supabase.from('gols').insert({
        partida_id: partida.id,
        jogador_id: jogadorSelecionado,
        minuto,
        tipo
      });
      setJogadorSelecionado('');
      setMinuto('');
      carregarDados();
    } catch (e) {
      alert("Erro ao salvar gol.");
    }
    setSalvando(false);
  };

  const apagarGol = async (golId: string) => {
    if (confirm("Tem certeza que deseja apagar este gol?")) {
      await supabase.from('gols').delete().eq('id', golId);
      carregarDados();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center gap-2"><FileText size={18} className="text-emerald-500"/> Registro de Gols</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-center text-sm text-slate-400 mb-6 border-b border-slate-800 pb-4">
            ID: <span className="font-mono text-slate-200">{partida.id}</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Autor do Gol</label>
              <select 
                value={jogadorSelecionado} 
                onChange={e => setJogadorSelecionado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Selecione o Jogador --</option>
                {jogadores.map(jg => (
                  <option key={jg.id} value={jg.id}>
                    {jg.nome} ({jg.equipes?.nome})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Minuto</label>
                <input 
                  type="text" 
                  placeholder="Ex: 45+2" 
                  value={minuto}
                  onChange={e => setMinuto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Tipo de Gol</label>
                <select 
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="PENALTI">Pênalti</option>
                  <option value="CONTRA">Contra</option>
                  <option value="FALTA">Falta</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={registrarGol} 
              disabled={salvando}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4 border border-slate-700 disabled:opacity-50"
            >
              <Plus size={18} /> {salvando ? 'Salvando...' : 'Adicionar Gol à Súmula'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs text-slate-500 font-bold uppercase mb-3">Eventos Registrados</h4>
            
            {loading ? (
               <div className="text-center text-slate-500 text-sm">Carregando...</div>
            ) : golsRegistrados.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center text-slate-500 text-sm">
                Nenhum evento registrado nesta partida.
              </div>
            ) : (
              <ul className="space-y-2">
                {golsRegistrados.map(gol => (
                   <li key={gol.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex justify-between items-center text-sm">
                      <div>
                         <span className="font-bold text-emerald-400 mr-2">{gol.minuto}'</span>
                         <span className="text-white font-bold">{gol.jogadores?.nome}</span>
                         <span className="text-slate-500 ml-2">({gol.jogadores?.equipes?.nome})</span>
                         {gol.tipo !== 'NORMAL' && <span className="ml-2 text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">{gol.tipo}</span>}
                      </div>
                      <button onClick={() => apagarGol(gol.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16}/></button>
                   </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
