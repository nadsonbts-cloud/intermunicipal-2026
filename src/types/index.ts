export interface Selecao {
  id: string;
  nome: string;
  grupo: string; // GR-01 a GR-15
  escudoUrl?: string;
}

export interface Partida {
  id: string;
  mandante_id: string;
  visitante_id: string;
  gols_mandante: number | null;
  gols_visitante: number | null;
  status: 'AGENDADO' | 'AO_VIVO' | 'FINALIZADO';
  fase: number; // 1 = Primeira fase, 2 = Segunda Fase, etc.
  jogo_ida_volta: 1 | 2; // 1 para Ida, 2 para Volta
  rodada: number;
  data: string;
  cidade: string;
  estadio: string;
}

export interface EstatisticasJogador {
  idJogador: string;
  nome: string;
  selecaoId: string;
  gols: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
  fotoUrl?: string;
}

export interface ClassificacaoGrupo {
  selecaoId: string;
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
  jogosDisputados: number;
  aproveitamento?: number; // Para o ranqueamento geral considerando o Grupo 11
}
