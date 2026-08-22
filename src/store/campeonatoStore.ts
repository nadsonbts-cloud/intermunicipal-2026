import { create } from 'zustand';
import { Partida, Selecao, ClassificacaoGrupo } from '../types';
import { gerarCalendarioFase1 } from '../data/geradorCalendario';
import { supabase } from '@/lib/supabase';
import { ordenarClassificacao, calcularAproveitamento } from '../utils/tiebreakers';

interface CampeonatoState {
  selecoes: Selecao[];
  partidas: Partida[];
  classificacaoAtual: Record<string, ClassificacaoGrupo[]>;
  isCarregandoBanco: boolean;
  rankingGeral: ClassificacaoGrupo[];
  
  inicializarBanco: () => Promise<void>;
  atualizarPlacar: (partidaId: string, gols_mandante: number, gols_visitante: number, status: 'AGENDADO'|'AO_VIVO'|'FINALIZADO') => void;
  recalcularClassificacao: () => void;
  gerarChavesFase2: () => void;
  gerarChavesFase3: () => void;
}

const criarEstadoInicialClassificacao = (selecoes: Selecao[]): Record<string, ClassificacaoGrupo[]> => {
  const grupos: Record<string, ClassificacaoGrupo[]> = {};
  selecoes.forEach(s => {
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
  selecoes: [],
  partidas: [],
  classificacaoAtual: {},
  isCarregandoBanco: true,
  rankingGeral: [],

  inicializarBanco: async () => {
    // 1. Carregar Equipes
    const { data: equipesData, error: equipesError } = await supabase.from('equipes').select('*');
    if (equipesError) console.error("Erro ao carregar equipes:", equipesError);
    const selecoesCarregadas = (equipesData || []) as Selecao[];

    // Atualiza estado de selecoes e prepara classificação vazia
    set({ 
      selecoes: selecoesCarregadas, 
      classificacaoAtual: criarEstadoInicialClassificacao(selecoesCarregadas)
    });

    // 2. Carregar Partidas
    const { data: partidasData, error: partidasError } = await supabase.from('partidas').select('*').order('fase', { ascending: true });
    
    if (partidasError || !partidasData || partidasData.length === 0) {
      if (selecoesCarregadas.length > 0) {
        console.log("Partidas vazias. Semeando dados iniciais da Fase 1...");
        const partidasGeradas = gerarCalendarioFase1(selecoesCarregadas);
        await supabase.from('partidas').insert(partidasGeradas);
        set({ partidas: partidasGeradas, isCarregandoBanco: false });
      } else {
         set({ isCarregandoBanco: false });
      }
    } else {
      console.log("Dados carregados do Supabase!", partidasData.length, "partidas.");
      set({ partidas: partidasData as Partida[], isCarregandoBanco: false });
    }
    
    get().recalcularClassificacao();

    // 3. Inscrever-se para atualizações Realtime
    supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partidas' }, (payload) => {
        const novaPartida = payload.new as Partida;
        set(state => {
           const novasPartidas = state.partidas.map(p => p.id === novaPartida.id ? novaPartida : p);
           return { partidas: novasPartidas };
        });
        get().recalcularClassificacao();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipes' }, () => {
         // Se adicionarem/removerem equipe, recarrega a página
         window.location.reload();
      })
      .subscribe();
  },

  atualizarPlacar: (partidaId, gols_mandante, gols_visitante, status = 'FINALIZADO') => {
    set(state => {
      const novasPartidas = state.partidas.map(p => 
        p.id === partidaId ? { ...p, gols_mandante, gols_visitante, status } : p
      );
      return { partidas: novasPartidas };
    });
    get().recalcularClassificacao();
  },

  recalcularClassificacao: () => {
    const { partidas, selecoes } = get();
    if (selecoes.length === 0) return;

    const classificacao = criarEstadoInicialClassificacao(selecoes);
    
    partidas.filter(p => (p.status === 'FINALIZADO' || p.status === 'AO_VIVO') && p.fase === 1).forEach(p => {
      const mandante = selecoes.find(s => s.id === p.mandante_id);
      const visitante = selecoes.find(s => s.id === p.visitante_id);
      if(!mandante || !visitante) return;
      
      const cMandante = classificacao[mandante.grupo]?.find(c => c.selecaoId === mandante.id);
      const cVisitante = classificacao[visitante.grupo]?.find(c => c.selecaoId === visitante.id);
      
      if (!cMandante || !cVisitante) return;

      const gm = p.gols_mandante || 0;
      const gv = p.gols_visitante || 0;

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

  gerarChavesFase2: () => {},
  gerarChavesFase3: () => {}
}));
