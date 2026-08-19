import { EstatisticasJogador } from '@/types';
import { selecoesMock } from '@/data/mock';

// Mock de Artilheiros
const artilheirosMock: EstatisticasJogador[] = [
  { idJogador: '1', nome: 'João Pedro', selecaoId: selecoesMock[40].id, gols: 8, cartoesAmarelos: 1, cartoesVermelhos: 0 },
  { idJogador: '2', nome: 'Carlos Silva', selecaoId: selecoesMock[42].id, gols: 7, cartoesAmarelos: 2, cartoesVermelhos: 0 },
  { idJogador: '3', nome: 'Matheus Santos', selecaoId: selecoesMock[10].id, gols: 6, cartoesAmarelos: 0, cartoesVermelhos: 0 },
  { idJogador: '4', nome: 'Roberto Alves', selecaoId: selecoesMock[5].id, gols: 5, cartoesAmarelos: 3, cartoesVermelhos: 1 },
  { idJogador: '5', nome: 'Lucas Moura', selecaoId: selecoesMock[1].id, gols: 5, cartoesAmarelos: 1, cartoesVermelhos: 0 },
];

export default function ArtilhariaPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Artilharia</h1>
          <p className="text-slate-400 mt-2">Ranking dos maiores goleadores do campeonato.</p>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
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
            {artilheirosMock.map((jogador, index) => {
              const selecao = selecoesMock.find(s => s.id === jogador.selecaoId);
              
              return (
                <tr key={jogador.idJogador} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
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
                        {selecao?.nome.substring(0, 3).toUpperCase()}
                      </div>
                      {selecao?.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-2xl text-emerald-400">
                    {jogador.gols}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
