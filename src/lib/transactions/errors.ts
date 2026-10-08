export type FinanceErrorCode = 'unauthorized' | 'unavailable' | 'uncertain' | 'not-found' | 'conflict' | 'stale' | 'catalog' | 'invalid';
const messages: Record<FinanceErrorCode, string> = {
  unauthorized: 'A sessão precisa ser verificada novamente. Entre ou tente novamente.',
  unavailable: 'Não foi possível carregar os dados completos. Verifique a conexão e tente novamente.',
  uncertain: 'Não foi possível confirmar a gravação. Ela pode ter sido salva. Verifique e tente novamente com a mesma intenção.',
  'not-found': 'Lançamento ausente ou indisponível para esta conta.',
  conflict: 'A intenção de gravação está em conflito. Nenhum lançamento foi sobrescrito. Releia os dados antes de continuar.',
  stale: 'A sessão mudou durante a operação. Verifique o histórico antes de tentar novamente.',
  catalog: 'Não foi possível conferir o catálogo de categorias. Tente carregar novamente.',
  invalid: 'O serviço rejeitou os dados. Confira os campos antes de tentar novamente.',
};
export class FinanceError extends Error {
  constructor(public readonly code: FinanceErrorCode) { super(messages[code]); this.name = 'FinanceError'; }
}
export function financeMessage(error: unknown) {
  return error instanceof FinanceError ? error.message : 'Não foi possível concluir a operação financeira. Tente novamente.';
}

