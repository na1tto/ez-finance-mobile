export type AttemptKind = 'google' | 'signup' | 'confirmation' | 'recovery';
export type PendingAttempt = { id: string; kind: AttemptKind; createdAt: number; userId?: string };
export const attemptLifetime = 60 * 60 * 1000;

export function parsePending(raw: string | null, now = Date.now()): PendingAttempt | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as PendingAttempt;
    if (!/^[a-f0-9-]{36}$/.test(value.id) || !['google','signup','confirmation','recovery'].includes(value.kind)
      || !Number.isFinite(value.createdAt) || value.createdAt > now || now - value.createdAt > attemptLifetime) return null;
    return value;
  } catch { return null; }
}

export function parseCallback(raw: string, expected: string, pending: PendingAttempt | null) {
  const url = new URL(raw), base = new URL(expected);
  if (url.protocol !== base.protocol || url.host !== base.host || url.pathname !== base.pathname || url.hash
    || !pending || url.searchParams.getAll('attempt').length !== 1 || url.searchParams.get('attempt') !== pending.id) {
    throw new Error('Retorno inválido ou tentativa ausente. Inicie novamente neste navegador.');
  }
  if (url.searchParams.has('error')) throw new Error('Autenticação cancelada ou recusada. Inicie uma nova tentativa.');
  const codes = url.searchParams.getAll('code');
  if (codes.length !== 1 || !codes[0] || codes[0].length > 4096) throw new Error('Link inválido ou expirado. Solicite um novo link.');
  return { code: codes[0], recovery: pending.kind === 'recovery' };
}

export function authMessage(error: unknown): string {
  const e = error as { code?: string; name?: string; status?: number };
  if (e?.name === 'StorageUnavailableError') return 'Não foi possível acessar o armazenamento da sessão. Verifique as permissões e tente novamente.';
  if (e?.name === 'AuthRetryableFetchError' || e instanceof TypeError || e?.status === 0 || (e?.status ?? 0) >= 500) return 'Serviço indisponível. Verifique sua conexão e tente novamente.';
  if (e?.code === 'email_not_confirmed') return 'Confirme seu email antes de entrar. Você pode reenviar a confirmação.';
  if (e?.status === 429 || e?.code === 'over_email_send_rate_limit') return 'Aguarde antes de solicitar novamente. O serviço limitou os envios.';
  if (e?.code === 'invalid_credentials') return 'Não foi possível entrar. Confira email e senha.';
  if (e?.code === 'weak_password') return 'A senha não atende aos requisitos do serviço. Use pelo menos seis caracteres.';
  return 'Não foi possível concluir. Verifique os dados ou solicite uma nova tentativa.';
}

export function isInvalidSession(error: unknown) {
  const e = error as { status?: number; code?: string };
  return e?.status === 401 || e?.status === 403 || ['refresh_token_not_found','refresh_token_already_used','session_not_found','bad_jwt'].includes(e?.code ?? '');
}
