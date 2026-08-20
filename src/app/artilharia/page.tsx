'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ArtilheiroDB {
  id: string;
  nome: string;
  equipes: {
    nome: string;
  };
  gols: { id: string, tipo: string }[];
}

interface ArtilheiroFormatado {
  id: string;
  nome: string;
  selecaoNome: string;
  totalGols: number;
}

export default function ArtilhariaPage() {
  const [artilheiros, setArtilheiros] = useState<ArtilheiroFormatado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarArtilharia() {
      try {
        const { data, error } = await supabase
          .from('jogadores')
          .select(`
            id,
            nome,
            equipes (nome),
            gols (id, tipo)
          `);

        if (error) throw error;

        // Formata os dados e conta apenas os gols que NÃO são contra
        const formatados: ArtilheiroFormatado[] = (data as any[]).map(jogador => {
          const golsPro = jogador.gols ? jogador.gols.filter((g: any) => g.tipo !== 'CONTRA').length : 0;
          return {
            id: jogador.id,
            nome: jogador.nome,
            selecaoNome: jogador.equipes?.nome || 'Sem Equipe',
            totalGols: golsPro
          };
        });

        // Remove quem tem 0 gols e ordena decrescente
        const ranking = formatados
          .filter(j => j.totalGols > 0)
          .sort((a, b) => b.totalGols - a.totalGols);

        setArtilheiros(ranking);
      } catch (err) {
        console.error("Erro ao buscar artilharia:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarArtilharia();
  }, []);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Artilharia</h1>
          <p className="text-slate-400 mt-2">Ranking dos maiores goleadores oficiais do campeonato.</p>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {carregando ? (
          <div className="p-8 text-center text-slate-400">Carregando artilheiros...</div>
        ) : artilheiros.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-xl font-bold text-slate-300">Nenhum gol registrado</h3>
            <p className="text-slate-500 mt-2">Os artilheiros aparecerão aqui assim que as súmulas forem preenchidas no painel administrativo.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-16 text-center">Pos</th>
                <th className="px-6 py-4">Jogador</th>
                <th className="px-6 py-4">Seleção</th>
                <th className="px-6 py-4 text-center">Gols</th>
              </tr>
            </thead>
            <tbody>
              {artilheiros.map((jogador, index) => (
                <tr key={jogador.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-slate-300/20 text-slate-300' : index === 2 ? 'bg-amber-700/20 text-amber-600' : 'text-slate-500'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-200 text-base">
                    {jogador.nome}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold border border-slate-700">
                        {jogador.selecaoNome.substring(0, 3).toUpperCase()}
                      </div>
                      {jogador.selecaoNome}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-2xl text-emerald-400">
                    {jogador.totalGols}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
