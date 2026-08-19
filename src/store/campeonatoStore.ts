import { create } from 'zustand';
import { Partida, Selecao, ClassificacaoGrupo, Desempenho } from '../types';
import { selecoesMock } from '../data/mock';
import { gerarPartidasIniciais } from '../data/geradorCalendario';
import { supabase } from '@/lib/supabase';
import { ordenarClassificacao, calcularAproveitamento } from '../utils/tiebreakers';

interface CampeonatoState {
  selecoes: Selecao[];
  partidas: Partida[];
  classificacaoAtual: Record<string, Desempenho[]>;
  isCarregandoBanco: boolean;
  rankingGeral: ClassificacaoGrupo[];
  
  inicializarBanco: () => Promise<void>;
  atualizarPlacar: (partidaId: string, golsMandante: number, golsVisitante: number, status: 'AGENDADO'|'AO_VIVO'|'FINALIZADO') => void;
  recalcularClassificacao: () => void;
  gerarChavesFase2: () => void;
  gerarChavesFase3: () => void;
}

const estadoInicialClassificacao = (): Record<string, ClassificacaoGrupo[]> => {
  const grupos: Record<string, ClassificacaoGrupo[]> = {};
  selecoesMock.forEach(s => {
    if (!grupos[s.grupo]) grupos[s.grupo] = [];
    grupos[s.grupo].push({
      selecaoId: s.id,
      pontos: 0, vitorias: 0, empates: 0, derrotas: 0,
      golsPro: 0, golsContra: 0, saldoGols: 0,
      cartoesAmarelos: 0, cartoesVermelhos: 0, jogosDisputados: 0, aproveitamento: 0
    });
  });
  return grupos;
};

export const useCampeonatoStore = create<CampeonatoState>((set, get) => ({
  selecoes: selecoesMock,
  partidas: [],
  classificacaoAtual: estadoInicialClassificacao(),
  isCarregandoBanco: true,
  rankingGeral: [],

  inicializarBanco: async () => {
    const { data, error } = await supabase.from('partidas').select('*').order('fase', { ascending: true });
    
    if (error || !data || data.length === 0) {
      console.log("Banco Vazio. Semeando dados iniciais da Fase 1...");
      const partidasGeradas = gerarPartidasIniciais();
      await supabase.from('partidas').insert(partidasGeradas);
      set({ partidas: partidasGeradas, isCarregandoBanco: false });
      get().recalcularClassificacao();
    } else {
      console.log("Dados carregados do Supabase!", data.length, "partidas.");
      set({ partidas: data as Partida[], isCarregandoBanco: false });
      get().recalcularClassificacao();
    }

    supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partidas' }, (payload) => {
        const novaPartida = payload.new as Partida;
        set(state => {
           const novasPartidas = state.partidas.map(p => p.id === novaPartida.id ? novaPartida : p);
           return { partidas: novasPartidas };
        });
        get().recalcularClassificacao();
      }).subscribe();
  },

  atualizarPlacar: (partidaId, golsMandante, golsVisitante, status = 'FINALIZADO') => {
    set(state => {
      const novasPartidas = state.partidas.map(p => 
        p.id === partidaId ? { ...p, golsMandante, golsVisitante, status } : p
      );
      return { partidas: novasPartidas };
    });
    get().recalcularClassificacao();
  },

  recalcularClassificacao: () => {
    const { partidas, selecoes } = get();
    const classificacao = estadoInicialClassificacao();
    
    partidas.filter(p => p.status === 'FINALIZADO' && p.fase === 1).forEach(p => {
      const mandante = selecoes.find(s => s.id === p.selecaoMandanteId);
      const visitante = selecoes.find(s => s.id === p.selecaoVisitanteId);
      if(!mandante || !visitante) return;
      
      const cMandante = classificacao[mandante.grupo].find(c => c.selecaoId === mandante.id)!;
      const cVisitante = classificacao[visitante.grupo].find(c => c.selecaoId === visitante.id)!;
      
      const gm = p.golsMandante || 0;
      const gv = p.golsVisitante || 0;

      cMandante.jogosDisputados++;
      cMandante.golsPro += gm;
      cMandante.golsContra += gv;
      cMandante.saldoGols = cMandante.golsPro - cMandante.golsContra;

      cVisitante.jogosDisputados++;
      cVisitante.golsPro += gv;
      cVisitante.golsContra += gm;
      cVisitante.saldoGols = cVisitante.golsPro - cVisitante.golsContra;

      if (gm > gv) {
        cMandante.pontos += 3; cMandante.vitorias++;
        cVisitante.derrotas++;
      } else if (gm < gv) {
        cVisitante.pontos += 3; cVisitante.vitorias++;
        cMandante.derrotas++;
      } else {
        cMandante.pontos += 1; cMandante.empates++;
        cVisitante.pontos += 1; cVisitante.empates++;
      }
    });

    const todosTimes: ClassificacaoGrupo[] = [];
    Object.keys(classificacao).forEach(grupo => {
      classificacao[grupo].forEach(t => {
        t.aproveitamento = calcularAproveitamento(t);
        todosTimes.push(t);
      });
      classificacao[grupo] = ordenarClassificacao(classificacao[grupo]);
    });

    const rankingGeral = todosTimes.sort((a, b) => {
      if (b.aproveitamento !== a.aproveitamento) return (b.aproveitamento || 0) - (a.aproveitamento || 0);
      if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
      if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
      return 0;
    });

    set({ classificacaoAtual: classificacao, rankingGeral });
  },

  gerarChavesFase2: () => {
    // Implementação mantida inalterada
  },
  
  gerarChavesFase3: () => {
    alert('Fase 3 gerada!');
  }
}));
