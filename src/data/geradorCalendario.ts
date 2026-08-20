import { Partida, Selecao } from '../types';
import { v4 as uuidv4 } from 'uuid'; // need to install uuid, wait, no, I'll use a simple id generator

const geradorId = () => Math.random().toString(36).substr(2, 9);

export const gerarCalendarioFase1 = (selecoes: Selecao[]): Partida[] => {
  const partidas: Partida[] = [];
  const grupos = [...new Set(selecoes.map(s => s.grupo))];

  // Datas fictícias para as 6 rodadas baseadas no regulamento
  const datasRodadas = [
    '02/08/2026 15:00', // Rodada 1
    '09/08/2026 15:00', // Rodada 2
    '16/08/2026 15:00', // Rodada 3
    '23/08/2026 15:00', // Rodada 4
    '30/08/2026 15:00', // Rodada 5
    '06/09/2026 15:00', // Rodada 6
  ];

  grupos.forEach(grupo => {
    const times = selecoes.filter(s => s.grupo === grupo);
    
    // Tratamento especial para o Grupo 11 que tem apenas 3 equipes (Irajuba, Itiruçu, Jaguaquara)
    if (times.length === 3) {
      // T1, T2, T3
      // Turno: R1(T1xT2), R2(T2xT3), R3(T3xT1)
      // Returno: R4(T2xT1), R5(T3xT2), R6(T1xT3)
      const confrontos = [
        { mandante: times[0], visitante: times[1], rodada: 1 },
        { mandante: times[1], visitante: times[2], rodada: 2 },
        { mandante: times[2], visitante: times[0], rodada: 3 },
        { mandante: times[1], visitante: times[0], rodada: 4 },
        { mandante: times[2], visitante: times[1], rodada: 5 },
        { mandante: times[0], visitante: times[2], rodada: 6 },
      ];

      confrontos.forEach(c => {
        partidas.push(criarPartida(c.mandante, c.visitante, c.rodada, datasRodadas[c.rodada - 1]));
      });
    } else if (times.length === 4) {
      // 4 Times - Round Robin
      // R1: T1xT2, T3xT4
      // R2: T2xT3, T4xT1
      // R3: T1xT3, T2xT4
      // R4: T3xT1, T4xT2
      // R5: T3xT2, T1xT4
      // R6: T2xT1, T4xT3
      const confrontos = [
        // Rodada 1
        { mandante: times[0], visitante: times[1], rodada: 1 },
        { mandante: times[2], visitante: times[3], rodada: 1 },
        // Rodada 2
        { mandante: times[1], visitante: times[2], rodada: 2 },
        { mandante: times[3], visitante: times[0], rodada: 2 },
        // Rodada 3
        { mandante: times[0], visitante: times[2], rodada: 3 },
        { mandante: times[1], visitante: times[3], rodada: 3 },
        // Rodada 4 (Inverte R3)
        { mandante: times[2], visitante: times[0], rodada: 4 },
        { mandante: times[3], visitante: times[1], rodada: 4 },
        // Rodada 5 (Inverte R2)
        { mandante: times[2], visitante: times[1], rodada: 5 },
        { mandante: times[0], visitante: times[3], rodada: 5 },
        // Rodada 6 (Inverte R1)
        { mandante: times[1], visitante: times[0], rodada: 6 },
        { mandante: times[3], visitante: times[2], rodada: 6 },
      ];

      confrontos.forEach(c => {
        partidas.push(criarPartida(c.mandante, c.visitante, c.rodada, datasRodadas[c.rodada - 1]));
      });
    }
  });

  return partidas;
};

const criarPartida = (mandante: Selecao, visitante: Selecao, rodada: number, data: string): Partida => {
  // Regra de punição de mando de campo solicitada pelo usuário
  let cidadeMandante = `Mando de ${mandante.nome}`;
  let estadioMandante = `Estádio Municipal de ${mandante.nome}`;

  if (mandante.nome === 'Maragojipe') {
    cidadeMandante = 'São Félix (Punição)';
    estadioMandante = 'Estádio Alternativo (Maragojipe punido)';
  } else if (mandante.nome === 'Itapetinga') {
    cidadeMandante = 'Macarani (Punição)';
    estadioMandante = 'Estádio Alternativo (Itapetinga punido)';
  }

  return {
    id: `MATCH_${geradorId()}`,
    mandante_id: mandante.id,
    visitante_id: visitante.id,
    gols_mandante: null,
    gols_visitante: null,
    status: 'AGENDADO',
    fase: 1,
    jogo_ida_volta: rodada <= 3 ? 1 : 2,
    rodada,
    data,
    cidade: cidadeMandante,
    estadio: estadioMandante
  };
};


