import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface Jogador {
  id: string;
  nome: string;
  equipe_id: string;
  equipes?: { nome: string };
}

export default function JogadoresCRUD() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [equipes, setEquipes] = useState<{id: string, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Jogador>>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const { data: equipesData } = await supabase.from('equipes').select('id, nome').order('nome');
    if (equipesData) setEquipes(equipesData);

    const { data: jogadoresData } = await supabase.from('jogadores').select('id, nome, equipe_id, equipes(nome)').order('nome');
    if (jogadoresData) setJogadores(jogadoresData as any);
    
    setLoading(false);
  };

  const abrirNovo = () => {
    setFormData({ nome: '', equipe_id: equipes[0]?.id || '' });
    setModalOpen(true);
  };

  const abrirEdicao = (jg: Jogador) => {
    setFormData(jg);
    setModalOpen(true);
  };

  const salvar = async () => {
    if (!formData.nome || !formData.equipe_id) return alert('Preencha os campos obrigatórios');
    setSalvando(true);

    try {
      if (formData.id) {
        await supabase.from('jogadores').update({ nome: formData.nome, equipe_id: formData.equipe_id }).eq('id', formData.id);
      } else {
        await supabase.from('jogadores').insert({ nome: formData.nome, equipe_id: formData.equipe_id });
      }
      setModalOpen(false);
      carregarDados();
    } catch (e) {
      alert("Erro ao salvar jogador");
    }
    setSalvando(false);
  };

  const excluir = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o jogador ${nome}? Seus gols também sumirão.`)) {
      await supabase.from('jogadores').delete().eq('id', id);
      carregarDados();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gerenciar Jogadores</h2>
        <button onClick={abrirNovo} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm">
          <Plus size={16}/> Novo Jogador
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-8">Carregando jogadores...</div>
      ) : jogadores.length === 0 ? (
         <div className="text-center text-slate-400 py-8">Nenhum jogador cadastrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Seleção</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {jogadores.map(jg => (
                <tr key={jg.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-bold text-slate-200">{jg.nome}</td>
                  <td className="px-4 py-3 text-slate-400">{jg.equipes?.nome}</td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <button onClick={() => abrirEdicao(jg)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Edit size={14}/></button>
                    <button onClick={() => excluir(jg.id, jg.nome)} className="p-2 bg-red-900/50 hover:bg-red-800 text-red-400 rounded"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg">{formData.id ? 'Editar Jogador' : 'Novo Jogador'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Nome do Jogador</label>
                <input 
                  type="text" 
                  value={formData.nome || ''}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Seleção</label>
                <select 
                  value={formData.equipe_id || ''}
                  onChange={e => setFormData({...formData, equipe_id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500" 
                >
                  {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
                </select>
              </div>
              <button 
                onClick={salvar}
                disabled={salvando}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
              >
                <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Jogador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
