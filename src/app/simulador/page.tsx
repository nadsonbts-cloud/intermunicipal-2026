'use client';
import { useState, useEffect } from 'react';
import { useCampeonatoStore } from '@/store/campeonatoStore';

export default function SimuladorPage() {
  const { partidas, selecoes, atualizarPlacar, gerarChavesFase2 } = useCampeonatoStore();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) return null;

  const jogosFase2Ida = partidas.filter(p => p.fase === 2 && p.jogoDeIdaOuVolta === 1);
  const jogosFase2Volta = partidas.filter(p => p.fase === 2 && p.jogoDeIdaOuVolta === 2);

  const handlePlacarBlur = (id: string, gm: string, gv: string) => {
    if (gm !== '' && gv !== '') {
      atualizarPlacar(id, parseInt(gm), parseInt(gv), 'FINALIZADO');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mata-Mata (Simulador)</h1>
          <p className="text-slate-400 mt-2">Gere a 2ª Fase e simule os placares de ida e volta.</p>
        </div>
        <button 
          onClick={gerarChavesFase2}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-900/50"
        >
          Gerar Chaves da 2ª Fase
        </button>
      </header>

      {jogosFase2Ida.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800">
          <p className="text-slate-500 mb-4 text-lg">As chaves da 2ª fase ainda não foram geradas.</p>
          <p className="text-slate-600 text-sm">Preencha os resultados da Fase 1 ou clique no botão acima para forçar a geração.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {jogosFase2Ida.map((ida, idx) => {
            const volta = jogosFase2Volta[idx];
            const mandanteIda = selecoes.find(s => s.id === ida.selecaoMandanteId)!;
            const visitanteIda = selecoes.find(s => s.id === ida.selecaoVisitanteId)!;
            
            // Calculo de agregado
            const gmIda = ida.golsMandante || 0; const gvIda = ida.golsVisitante || 0;
            const gmVolta = volta?.golsMandante || 0; const gvVolta = volta?.golsVisitante || 0;
            
            // O visitante da ida é o mandante da volta
            const totalMandanteIda = gmIda + gvVolta;
            const totalVisitanteIda = gvIda + gmVolta;

            let classificado = '---';
            if (ida.status === 'FINALIZADO' && volta?.status === 'FINALIZADO') {
              if (totalMandanteIda > totalVisitanteIda) classificado = mandanteIda.nome;
              else if (totalVisitanteIda > totalMandanteIda) classificado = visitanteIda.nome;
              else classificado = 'Pênaltis...';
            }

            return (
              <div key={ida.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="text-emerald-500 font-bold text-xl">GR-{16 + idx}</div>
                
                <div className="flex-1 flex flex-col gap-4 w-full">
                  {/* IDA */}
                  <div className="flex items-center justify-between gap-4 bg-slate-800/50 p-3 rounded-lg">
                    <span className="text-xs text-slate-500 w-12">Ida</span>
                    <span className="text-slate-300 font-medium text-right flex-1">{mandanteIda.nome}</span>
                    <input 
                      type="number" id={`ida-m-${ida.id}`} defaultValue={ida.golsMandante ?? ''}
                      onBlur={(e) => handlePlacarBlur(ida.id, e.target.value, (document.getElementById(`ida-v-${ida.id}`) as HTMLInputElement).value)}
                      className="w-12 h-10 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono text-lg focus:border-emerald-500"
                    />
                    <span className="text-slate-600">x</span>
                    <input 
                      type="number" id={`ida-v-${ida.id}`} defaultValue={ida.golsVisitante ?? ''}
                      onBlur={(e) => handlePlacarBlur(ida.id, (document.getElementById(`ida-m-${ida.id}`) as HTMLInputElement).value, e.target.value)}
                      className="w-12 h-10 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono text-lg focus:border-emerald-500"
                    />
                    <span className="text-slate-300 font-medium flex-1">{visitanteIda.nome}</span>
                  </div>

                  {/* VOLTA */}
                  {volta && (
                    <div className="flex items-center justify-between gap-4 bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-xs text-slate-500 w-12">Volta</span>
                      <span className="text-slate-300 font-medium text-right flex-1">{visitanteIda.nome}</span>
                      <input 
                        type="number" id={`vol-m-${volta.id}`} defaultValue={volta.golsMandante ?? ''}
                        onBlur={(e) => handlePlacarBlur(volta.id, e.target.value, (document.getElementById(`vol-v-${volta.id}`) as HTMLInputElement).value)}
                        className="w-12 h-10 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono text-lg focus:border-emerald-500"
                      />
                      <span className="text-slate-600">x</span>
                      <input 
                        type="number" id={`vol-v-${volta.id}`} defaultValue={volta.golsVisitante ?? ''}
                        onBlur={(e) => handlePlacarBlur(volta.id, (document.getElementById(`vol-m-${volta.id}`) as HTMLInputElement).value, e.target.value)}
                        className="w-12 h-10 bg-slate-950 border border-slate-700 rounded text-center text-white font-mono text-lg focus:border-emerald-500"
                      />
                      <span className="text-slate-300 font-medium flex-1">{mandanteIda.nome}</span>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-32 text-center bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">Classificado</div>
                  <div className={`font-bold ${classificado !== '---' ? 'text-emerald-400' : 'text-slate-600'}`}>{classificado}</div>
                  <div className="text-[10px] text-slate-500 mt-2">Agr: {totalMandanteIda} x {totalVisitanteIda}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
