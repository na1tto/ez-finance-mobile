import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { authMessage, isInvalidSession, parseCallback, parsePending, type AttemptKind, type PendingAttempt } from './contracts';
import { clearVerifiers, type AuthStorage } from './storage';

export type AuthState = {
  status: 'restoring' | 'signedOut' | 'authenticated' | 'recovery' | 'unavailable';
  session: Session | null; busy: boolean; message: string; pending: boolean; messageKind?: 'info' | 'error';
};
type Dependencies = {
  client: SupabaseClient; storage: AuthStorage; key: string;
  redirect: (path: 'callback' | 'reset-password') => string;
  randomId: () => string;
  serialize: <T>(key: string, task: () => Promise<T>) => Promise<T>;
  openOAuth: (url: string, redirect: string, complete: (url: string) => Promise<void>) => Promise<boolean>;
};

export class AuthController {
  private state: AuthState = { status: 'restoring', session: null, busy: false, message: '', pending: false };
  private listeners = new Set<() => void>();
  private generation = 0;
  private epoch = 0;
  private blocked = false;
  private exchanging = false;
  private recoveryEvent = false;
  private disposed = false;
  private unsubscribe?: () => void;
  private callbacks = new Map<string, Promise<void>>();
  private loggingOut?: Promise<void>;
  constructor(private d: Dependencies) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(patch: Partial<AuthState>) {
    // Presentation metadata only; do not classify errors by matching translated copy.
    const messageKind = patch.message === undefined ? this.state.messageKind : patch.messageKind ?? (patch.message ? 'error' : 'info');
    this.state = { ...this.state, ...patch, messageKind }; this.listeners.forEach(fn => fn());
  }
  private async pending() { return parsePending(await this.d.storage.getItem(this.d.key + '.attempt')); }
  private async finishAttempt() {
    await clearVerifiers(this.d.storage, this.d.key);
    await this.d.storage.removeItem(this.d.key + '.attempt');
    this.update({ pending: false });
  }
  async start(initialUrl?: string) {
    this.disposed = false;
    const { data } = this.d.client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && this.exchanging) this.recoveryEvent = true;
      // Never await SDK methods under its event lock.
      if (event === 'SIGNED_OUT') { this.epoch++; this.generation++; this.update({ status: 'signedOut', session: null }); }
      else if (!this.exchanging && !this.blocked && !this.state.busy) {
        this.update({ status: 'restoring' });
        queueMicrotask(() => { if (!this.disposed && !this.exchanging) void this.validate(session); });
      }
    });
    this.unsubscribe = () => data.subscription.unsubscribe();
    try {
      const pending = await this.pending(); this.update({ pending: !!pending });
      if (initialUrl && this.isCallback(initialUrl)) {
        const url = new URL(initialUrl);
        if (url.search || url.hash) { await this.handleCallback(initialUrl); return; }
      }
      const { data: current, error } = await this.d.client.auth.getSession();
      if (error) throw error;
      await this.validate(current.session);
    } catch (error) { this.update({ status: 'unavailable', session: null, message: authMessage(error) }); }
  }
  stop() { this.disposed = true; this.generation++; this.unsubscribe?.(); }
  invalidateLocal() { this.blocked = true; this.epoch++; this.generation++; this.update({ status: 'signedOut', session: null }); }
  async synchronizeSession() {
    // A changed session invalidates any private state and responses from the old account.
    this.blocked = false; this.epoch++; this.generation++;
    this.update({ status: 'restoring', session: null });
    try {
      // Another tab commits callback purpose/identity before removing its attempt.
      // Do not expose its just-issued session before that commit.
      const pending = await this.pending();
      if (pending) { this.update({ pending: true }); return; }
      this.update({ pending: false });
      await this.retry();
    } catch (e) { this.update({ status: 'unavailable', session: null, message: authMessage(e) }); }
  }
  private isCallback(raw: string) {
    try { const u = new URL(raw); return [this.d.redirect('callback'),this.d.redirect('reset-password')].some(base => {
      const b = new URL(base); return u.protocol === b.protocol && u.host === b.host && u.pathname === b.pathname;
    }); } catch { return false; }
  }
  async retry() {
    this.blocked = false;
    this.update({ status: 'restoring', message: '' });
    try { const { data, error } = await this.d.client.auth.getSession(); if (error) throw error; await this.validate(data.session); }
    catch (e) { this.update({ status: 'unavailable', session: null, message: authMessage(e) }); }
  }
  private async validate(session: Session | null) {
    const version = ++this.generation;
    if (this.blocked || this.disposed) return;
    if (!session) { this.update({ status: 'signedOut', session: null }); return; }
    try {
      // SDK broadcasts can precede callback identity/purpose commit just like storage
      // events. A newly written token alone must not admit another tab to private UI.
      if (!this.exchanging && await this.pending()) {
        if (version !== this.generation || this.blocked || this.disposed) return;
        this.update({ status: 'restoring', session: null, pending: true });
        return;
      }
      const { data, error } = await this.d.client.auth.getUser(session.access_token);
      if (error) throw error;
      if (!data.user.email_confirmed_at || data.user.id !== session.user.id) throw { status: 401 };
      const recoveryUser = await this.d.storage.getItem(this.d.key + '.recovery');
      if (version !== this.generation || this.blocked || this.disposed) return;
      this.update({ status: recoveryUser === data.user.id ? 'recovery' : 'authenticated', session: { ...session, user: data.user } });
    } catch (e) {
      if (version !== this.generation || this.blocked || this.disposed) return;
      this.update({ status: isInvalidSession(e) ? 'signedOut' : 'unavailable', session: null, message: authMessage(e) });
      if (isInvalidSession(e)) await this.logout();
    }
  }
  private async operation(task: () => Promise<void>) {
    if (this.state.busy) return false;
    const version = this.generation;
    this.update({ busy: true, message: '' });
    try { await this.d.serialize(this.d.key, task); return true; }
    catch (e) {
      if (version <= this.generation) this.update({ message: e instanceof Error && ['Retorno inválido ou tentativa ausente. Inicie novamente neste navegador.','Link inválido ou expirado. Solicite um novo link.','Autenticação cancelada ou recusada. Inicie uma nova tentativa.','Existe uma tentativa pendente. Cancele-a antes de iniciar outra.','Este navegador não permite coordenar a autenticação entre abas. Use um navegador atualizado.','PKCE S256 não está disponível nesta plataforma.'].includes(e.message) ? e.message : authMessage(e) });
      return false;
    } finally { this.update({ busy: false }); }
  }
  private async begin(kind: AttemptKind) {
    if (await this.pending()) {
      this.update({ pending: true });
      throw new Error('Existe uma tentativa pendente. Cancele-a antes de iniciar outra.');
    }
    await this.finishAttempt();
    if (typeof crypto === 'undefined' || !crypto.subtle) throw new Error('PKCE S256 não está disponível nesta plataforma.');
    const pending: PendingAttempt = { id: this.d.randomId(), kind, createdAt: Date.now(), userId: this.state.session?.user.id };
    await this.d.storage.setItem(this.d.key + '.attempt', JSON.stringify(pending));
    this.update({ pending: true });
    const base = this.d.redirect(kind === 'recovery' ? 'reset-password' : 'callback');
    return { pending, redirect: `${base}?attempt=${encodeURIComponent(pending.id)}` };
  }
  async cancelAttempt() { await this.operation(async () => { await this.finishAttempt(); this.update({ messageKind: 'info', message: 'Tentativa cancelada. Links anteriores não serão aceitos.' }); }); }
  async signIn(email: string, password: string) {
    await this.operation(async () => {
      if (await this.pending()) {
        this.update({ pending: true });
        throw new Error('Existe uma tentativa pendente. Cancele-a antes de iniciar outra.');
      }
      this.blocked = false;
      const epoch = this.epoch;
      const { data, error } = await this.d.client.auth.signInWithPassword({ email: email.trim(), password });
      if (epoch !== this.epoch) { await this.logout(); return; }
      if (error) throw error;
      await this.validate(data.session);
    });
  }
  async emailLink(kind: 'signup' | 'confirmation' | 'recovery', email: string, password?: string) {
    await this.operation(async () => {
      const epoch = this.epoch;
      const { redirect } = await this.begin(kind);
      try {
        const result = kind === 'signup'
          ? await this.d.client.auth.signUp({ email: email.trim(), password: password ?? '', options: { emailRedirectTo: redirect } })
          : kind === 'confirmation'
            ? await this.d.client.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: redirect } })
            : await this.d.client.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirect });
        if (result.error) throw result.error;
        if (epoch !== this.epoch) { await this.finishAttempt(); return; }
        this.update({ messageKind: 'info', message: 'Se o endereço puder receber este pedido, você receberá um link. Abra-o neste mesmo navegador/dispositivo. Para reenviar, cancele a tentativa anterior.' });
      } catch (e) { await this.finishAttempt(); throw e; }
    });
  }
  async google(link = false) {
    let destination: { url: string; redirect: string } | undefined;
    await this.operation(async () => {
      const epoch = this.epoch;
      const user = this.state.session?.user;
      if (link && (!user || !user.email_confirmed_at)) throw { status: 401 };
      const { redirect } = await this.begin('google');
      try {
        const options = { redirectTo: redirect, skipBrowserRedirect: true, scopes: 'openid email profile' };
        // Same-email verified identities are linked by Auth, never merged by the app.
        // The pending user ID additionally rejects a switch to a different Google account.
        const result = await this.d.client.auth.signInWithOAuth({ provider: 'google', options });
        if (result.error) throw result.error;
        if (epoch !== this.epoch) { await this.finishAttempt(); return; }
        if (!result.data.url) throw new Error();
        destination = { url: result.data.url, redirect };
      } catch (e) { await this.finishAttempt(); throw e; }
    });
    if (destination) {
      try { const completed = await this.d.openOAuth(destination.url, destination.redirect, url => this.handleCallback(url)); if (!completed) await this.cancelAttempt(); }
      catch { this.update({ message: 'Não foi possível abrir o Google. Cancele a tentativa e tente novamente.' }); }
    }
  }
  handleCallback(raw: string): Promise<void> {
    const previous = this.callbacks.get(raw); if (previous) return previous;
    if (this.state.busy) return Promise.resolve();
    // Suppress session events until code, purpose and identity have been checked.
    this.exchanging = true;
    this.recoveryEvent = false;
    const result = this.operation(async () => {
      const epoch = this.epoch;
      const pending = await this.pending();
      let exchangedSession = false;
      try {
        const path = pending?.kind === 'recovery' ? 'reset-password' : 'callback';
        const parsed = parseCallback(raw, this.d.redirect(path), pending);
        this.blocked = false;
        const { data, error } = await this.d.client.auth.exchangeCodeForSession(parsed.code);
        if (epoch !== this.epoch) { await this.logout(); return; }
        if (error) throw error;
        exchangedSession = !!data.session;
        if (!data.session || !data.user || !data.user.email_confirmed_at || (pending?.userId && data.user.id !== pending.userId)
          || (parsed.recovery !== this.recoveryEvent)) {
          await this.logout(); throw new Error();
        }
        if (parsed.recovery) await this.d.storage.setItem(this.d.key + '.recovery', data.user.id);
        else await this.d.storage.removeItem(this.d.key + '.recovery');
        await this.finishAttempt();
        await this.validate(data.session);
        if (this.state.status === 'authenticated' || this.state.status === 'recovery') this.update({ messageKind: 'info', message: parsed.recovery ? 'Link verificado. Defina sua nova senha.' : 'Autenticação confirmada.' });
      } catch (e) {
        if (exchangedSession && !this.blocked) await this.logout();
        // An unrelated/obsolete callback must not invalidate another active attempt.
        if (pending) { try { if (new URL(raw).searchParams.get('attempt') === pending.id) await this.finishAttempt(); } catch {} }
        if (!this.state.session) this.update({ status: 'signedOut' });
        throw e;
      }
    }).then(() => {}).finally(() => { this.exchanging = false; });
    this.callbacks.set(raw, result);
    if (this.callbacks.size > 8) this.callbacks.delete(this.callbacks.keys().next().value!);
    return result;
  }
  async changePassword(password: string) {
    return this.operation(async () => {
      if (this.state.status !== 'recovery' || !this.state.session) throw { status: 401 };
      const { error } = await this.d.client.auth.updateUser({ password }); if (error) throw error;
      await this.logout();
      this.update({ messageKind: 'info', message: 'Senha atualizada. Entre novamente com sua nova senha.' });
    });
  }
  logout(): Promise<void> {
    if (this.loggingOut) return this.loggingOut;
    const wasBusy = this.state.busy;
    this.blocked = true; this.epoch++; this.generation++;
    this.update({ status: 'signedOut', session: null, message: '', busy: true });
    this.loggingOut = (async () => {
      let failed = false;
      try { const { error } = await this.d.client.auth.signOut({ scope: 'local' }); failed = !!error; } catch { failed = true; }
      try {
        await this.d.storage.removeItem(this.d.key);
        await this.d.storage.removeItem(this.d.key + '-user');
        await this.d.storage.removeItem(this.d.key + '.recovery');
        await this.finishAttempt();
      } catch { failed = true; }
      if (failed) this.update({ message: 'Acesso local bloqueado. Não foi possível confirmar toda a limpeza/revogação; verifique a conexão e o armazenamento antes de entrar novamente.' });
    })().finally(() => { this.loggingOut = undefined; this.update({ busy: wasBusy }); });
    return this.loggingOut;
  }
}
