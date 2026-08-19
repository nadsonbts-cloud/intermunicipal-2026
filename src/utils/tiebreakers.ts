import { ClassificacaoGrupo } from '../types';

/**
 * Critérios de desempate da Fase 1:
 * 1. Pontos
 * 2. Vitórias
 * 3. Saldo de Gols (GD)
 * 4. Gols Pró (GF)
 * 5. Confronto Direto (Não implementado no mock simples, precisa do histórico de partidas)
 * 6. Menos Vermelhos
 * 7. Menos Amarelos
 * 8. Sorteio (Random se tudo empatar)
 */
export function ordenarClassificacao(times: ClassificacaoGrupo[]): ClassificacaoGrupo[] {
  return [...times].sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
    if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
    
    // Menos cartões vermelhos é melhor
    if (a.cartoesVermelhos !== b.cartoesVermelhos) return a.cartoesVermelhos - b.cartoesVermelhos;
    
    // Menos cartões amarelos é melhor
    if (a.cartoesAmarelos !== b.cartoesAmarelos) return a.cartoesAmarelos - b.cartoesAmarelos;

    // Em um cenário real, o confronto direto entraria antes dos cartões.
    return 0; // Empate absoluto
  });
}

/**
 * Calcula o aproveitamento (%) para equalizar o Grupo 11 com os demais na Classificação Geral
 * Aproveitamento = (Pontos / (JogosDisputados * 3)) * 100
 */
export function calcularAproveitamento(time: ClassificacaoGrupo): number {
  if (time.jogosDisputados === 0) return 0;
  return (time.pontos / (time.jogosDisputados * 3)) * 100;
}
