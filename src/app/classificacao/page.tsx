'use client';
import { useEffect, useState } from 'react';
import { useCampeonatoStore } from '@/store/campeonatoStore';

export default function ClassificacaoPage() {
  const { classificacaoAtual, selecoes } = useCampeonatoStore();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) return null;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Classificação Dinâmica</h1>
          <p className="text-slate-400 mt-2">Atualizada em tempo real conforme os jogos da aba principal. (Art. 43 considerado para GR-11)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {Object.entries(classificacaoAtual).map(([nomeGrupo, times]) => {
          // No GR-11 classificam 2. Nos demais classificam 3.
          const vagasClassificacao = nomeGrupo === 'GR-11' ? 2 : 3;

          return (
            <div key={nomeGrupo} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-emerald-400">{nomeGrupo}</h2>
                <span className="text-xs text-slate-400">{times.length} Equipes | Vagas: {vagasClassificacao}</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 bg-slate-950/50 uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-3 w-8 text-center">#</th>
                      <th className="px-3 py-3">Seleção</th>
                      <th className="px-2 py-3 text-center" title="Pontos">P</th>
                      <th className="px-2 py-3 text-center" title="Jogos">J</th>
                      <th className="px-2 py-3 text-center" title="Vitórias">V</th>
                      <th className="px-2 py-3 text-center" title="Saldo de Gols">SG</th>
                      <th className="px-2 py-3 text-center" title="Aproveitamento (Art 43)">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {times.map((time, index) => {
                      const selecao = selecoes.find(s => s.id === time.selecaoId);
                      const classificado = index < vagasClassificacao;
                      
                      return (
                        <tr key={time.selecaoId} className={`border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${classificado ? 'bg-emerald-900/10' : ''}`}>
                          <td className="px-3 py-3 text-center">
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${classificado ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-medium text-slate-200 flex items-center gap-2">
                            {selecao?.escudoUrl ? (
                              <img src={selecao.escudoUrl} alt={selecao.nome} className="w-5 h-5 object-contain" />
                            ) : (
                              <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-500">
                                {selecao?.nome.substring(0,2).toUpperCase()}
                              </div>
                            )}
                            {selecao?.nome}
                          </td>
                          <td className="px-2 py-3 text-center font-bold text-white">{time.pontos}</td>
                          <td className="px-2 py-3 text-center text-slate-400">{time.jogosDisputados}</td>
                          <td className="px-2 py-3 text-center text-slate-400">{time.vitorias}</td>
                          <td className="px-2 py-3 text-center text-slate-400">{time.saldoGols}</td>
                          <td className="px-2 py-3 text-center text-emerald-500/70 text-xs font-mono">{time.aproveitamento?.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
