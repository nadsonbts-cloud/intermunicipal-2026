'use client';
import { useState, useEffect } from 'react';
import { Clock, MapPin, Search } from 'lucide-react';
import { useCampeonatoStore } from '@/store/campeonatoStore';

export default function Home() {
  const { partidas, selecoes, atualizarPlacar, isCarregandoBanco, inicializarBanco } = useCampeonatoStore();
  const [faseFiltro, setFaseFiltro] = useState<number>(1);
  const [rodadaFiltro, setRodadaFiltro] = useState<number>(1);
  const [grupoFiltro, setGrupoFiltro] = useState<string>('Todos');
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    inicializarBanco();
  }, [inicializarBanco]);

  if (!montado) return null; // Evitar hydration mismatch no estado global
  
  if (isCarregandoBanco) {
    return <div className="flex justify-center items-center h-64 text-emerald-500 font-bold">Carregando Calendário...</div>;
  }

  let partidasFiltradas = partidas.filter(p => p.fase === faseFiltro && p.rodada === rodadaFiltro);
  
  if (grupoFiltro !== 'Todos') {
    partidasFiltradas = partidasFiltradas.filter(p => {
      const mandante = selecoes.find(s => s.id === p.mandante_id);
      return mandante?.grupo === grupoFiltro;
    });
  }

  const handleSalvarPlacar = (id: string, gm: number, gv: number) => {
    atualizarPlacar(id, gm, gv, 'FINALIZADO');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Painel de Jogos (Oficial)</h1>
          <p className="text-slate-400 mt-2">Atualize os placares para recalcular as tabelas em tempo real.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={faseFiltro} onChange={(e) => setFaseFiltro(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value={1}>Fase 1 (Grupos)</option>
            <option value={2}>Fase 2 (Mata-mata)</option>
          </select>
          <select 
            value={rodadaFiltro} onChange={(e) => setRodadaFiltro(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            {[1,2,3,4,5,6].map(r => <option key={r} value={r}>Rodada {r}</option>)}
          </select>
          <select 
            value={grupoFiltro} onChange={(e) => setGrupoFiltro(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="Todos">Todos os Grupos</option>
            {Array.from({length: 15}, (_, i) => `GR-${String(i+1).padStart(2, '0')}`).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partidasFiltradas.map((jogo) => {
          const mandante = selecoes.find(s => s.id === jogo.mandante_id)!;
          const visitante = selecoes.find(s => s.id === jogo.visitante_id)!;

          // Calcula status dinâmico
          let statusExibicao = jogo.status;
          if (jogo.status !== 'FINALIZADO' && jogo.data) {
             const parts = jogo.data.split(' ');
             if(parts.length === 2) {
               const [day, month, year] = parts[0].split('/');
               const [hour, minute] = parts[1].split(':');
               const matchDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
               const now = new Date();
               
               // Se passou da hora do jogo, e faz menos de 2h30min, é AO VIVO
               if (now.getTime() >= matchDate.getTime()) {
                  if (now.getTime() <= matchDate.getTime() + (2.5 * 60 * 60 * 1000)) {
                     statusExibicao = 'AO_VIVO';
                  } else {
                     statusExibicao = 'FINALIZADO'; // Se passou de 2h30, considera finalizado pra não ficar ao vivo eternamente
                  }
               }
             }
          }

          return (
            <div key={jogo.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/20 flex flex-col justify-between">
              <div className="bg-slate-800/50 px-4 py-2 flex justify-between items-center border-b border-slate-800 text-xs font-semibold">
                <span className={`flex items-center gap-1 ${statusExibicao === 'FINALIZADO' ? 'text-slate-400' : 'text-emerald-400'}`}>
                  {statusExibicao === 'AO_VIVO' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                  {statusExibicao === 'FINALIZADO' ? 'ENCERRADO' : statusExibicao === 'AO_VIVO' ? 'AO VIVO' : 'AGENDADO'}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> {jogo.data}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1 w-24">
                    {mandante.escudoUrl ? (
                      <img src={mandante.escudoUrl} alt={mandante.nome} className="w-12 h-12 mx-auto mb-2 object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                        {mandante.nome.substring(0, 3).toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-slate-200 truncate" title={mandante.nome}>{mandante.nome}</p>
                  </div>
                  
                  <div className="px-2 flex gap-1 items-center">
                    <input 
                      type="number" 
                      min="0"
                      className="w-10 h-10 bg-slate-950 border border-slate-700 text-white rounded text-center text-xl font-bold focus:border-emerald-500 focus:outline-none"
                      defaultValue={jogo.gols_mandante ?? ''}
                      onBlur={(e) => {
                        if(e.target.value !== '') {
                           const gv = document.getElementById(`gv-${jogo.id}`) as HTMLInputElement;
                           if (gv.value !== '') handleSalvarPlacar(jogo.id, parseInt(e.target.value), parseInt(gv.value));
                        }
                      }}
                      id={`gm-${jogo.id}`}
                    />
                    <span className="text-slate-500">x</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-10 h-10 bg-slate-950 border border-slate-700 text-white rounded text-center text-xl font-bold focus:border-emerald-500 focus:outline-none"
                      defaultValue={jogo.gols_visitante ?? ''}
                      onBlur={(e) => {
                        if(e.target.value !== '') {
                           const gm = document.getElementById(`gm-${jogo.id}`) as HTMLInputElement;
                           if (gm.value !== '') handleSalvarPlacar(jogo.id, parseInt(gm.value), parseInt(e.target.value));
                        }
                      }}
                      id={`gv-${jogo.id}`}
                    />
                  </div>

                  <div className="text-center flex-1 w-24">
                    {visitante.escudoUrl ? (
                      <img src={visitante.escudoUrl} alt={visitante.nome} className="w-12 h-12 mx-auto mb-2 object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                        {visitante.nome.substring(0, 3).toUpperCase()}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-slate-200 truncate" title={visitante.nome}>{visitante.nome}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 mt-auto pt-4 border-t border-slate-800">
                  <span className="flex items-center gap-1 truncate pr-2" title={jogo.estadio}>
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{jogo.cidade}</span>
                  </span>
                  <span className="text-emerald-500/70 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                    {mandante.grupo}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {partidasFiltradas.length === 0 && (
           <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
             <Search size={48} className="mb-4 opacity-20" />
             <p>Nenhuma partida encontrada para este filtro.</p>
           </div>
        )}
      </div>
    </div>
  );
}
