import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface Equipe {
  id: string;
  nome: string;
  grupo: string;
  escudoUrl?: string;
}

export default function EquipesCRUD() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Equipe>>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarEquipes();
  }, []);

  const carregarEquipes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('equipes').select('*').order('nome');
    if (!error && data) setEquipes(data);
    setLoading(false);
  };

  const abrirNovo = () => {
    setFormData({ nome: '', grupo: 'GR-01', escudoUrl: '' });
    setModalOpen(true);
  };

  const abrirEdicao = (eq: Equipe) => {
    setFormData(eq);
    setModalOpen(true);
  };

  const salvar = async () => {
    if (!formData.nome || !formData.grupo) return alert('Preencha os campos obrigatórios');
    setSalvando(true);

    try {
      if (formData.id) {
        // Atualizar
        await supabase.from('equipes').update({ nome: formData.nome, grupo: formData.grupo, escudoUrl: formData.escudoUrl }).eq('id', formData.id);
      } else {
        // Inserir
        await supabase.from('equipes').insert({ nome: formData.nome, grupo: formData.grupo, escudoUrl: formData.escudoUrl });
      }
      setModalOpen(false);
      carregarEquipes();
    } catch (e) {
      alert("Erro ao salvar equipe");
    }
    setSalvando(false);
  };

  const excluir = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a equipe ${nome}? Todos os jogadores dela serão apagados.`)) {
      await supabase.from('equipes').delete().eq('id', id);
      carregarEquipes();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gerenciar Equipes</h2>
        <button onClick={abrirNovo} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm">
          <Plus size={16}/> Nova Equipe
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-8">Carregando equipes...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Escudo</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipes.map(eq => (
                <tr key={eq.id} className="border-b border-slate-800/50">
                  <td className="px-4 py-3">
                    {eq.escudoUrl ? (
                      <img src={eq.escudoUrl} alt={eq.nome} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {eq.nome.substring(0,2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-200">{eq.nome}</td>
                  <td className="px-4 py-3 text-slate-400">{eq.grupo}</td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <button onClick={() => abrirEdicao(eq)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Edit size={14}/></button>
                    <button onClick={() => excluir(eq.id, eq.nome)} className="p-2 bg-red-900/50 hover:bg-red-800 text-red-400 rounded"><Trash2 size={14}/></button>
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
              <h3 className="text-white font-bold text-lg">{formData.id ? 'Editar Equipe' : 'Nova Equipe'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Nome da Seleção</label>
                <input 
                  type="text" 
                  value={formData.nome || ''}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Grupo (ex: GR-01)</label>
                <input 
                  type="text" 
                  value={formData.grupo || ''}
                  onChange={e => setFormData({...formData, grupo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">URL do Escudo (Link da Imagem)</label>
                <input 
                  type="url" 
                  placeholder="https://exemplo.com/escudo.png"
                  value={formData.escudoUrl || ''}
                  onChange={e => setFormData({...formData, escudoUrl: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-emerald-500" 
                />
              </div>
              <button 
                onClick={salvar}
                disabled={salvando}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
              >
                <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Equipe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
