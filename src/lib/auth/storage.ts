export interface AuthStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export class StorageUnavailableError extends Error {
  constructor() { super('Não foi possível acessar o armazenamento da sessão. Verifique as permissões e tente novamente.'); this.name = 'StorageUnavailableError'; }
}

export function trackedStorage(base: AuthStorage): AuthStorage {
  return {
    getItem: key => base.getItem(key),
    async setItem(key, value) {
      if (key.includes('-code-verifier')) {
        const registryKey = key.slice(0, key.indexOf('-')) + '.verifier-keys';
        const keys: string[] = JSON.parse(await base.getItem(registryKey) ?? '[]');
        if (!keys.includes(key)) await base.setItem(registryKey, JSON.stringify([...keys, key]));
      }
      await base.setItem(key, value);
    },
    removeItem: key => base.removeItem(key),
  };
}

export async function clearVerifiers(base: AuthStorage, key: string) {
  const registryKey = key + '.verifier-keys';
  const keys: unknown = JSON.parse(await base.getItem(registryKey) ?? '[]');
  if (!Array.isArray(keys)) throw new StorageUnavailableError();
  for (const item of keys) if (typeof item === 'string' && item.startsWith(key + '-') && item.includes('-code-verifier')) await base.removeItem(item);
  await base.removeItem(registryKey);
}

export function sessionKey(url: string) {
  // Full endpoint, without lossy host substitutions or shared sessions across projects.
  return 'ezfinance.auth.' + Array.from(url).map(c => c.charCodeAt(0).toString(16)).join('_');
}

export function browserStorage(getStorage: () => AuthStorage): AuthStorage {
  return {
    async getItem(key) { try { return await getStorage().getItem(key); } catch { throw new StorageUnavailableError(); } },
    async setItem(key, value) { try { await getStorage().setItem(key, value); } catch { throw new StorageUnavailableError(); } },
    async removeItem(key) { try { await getStorage().removeItem(key); } catch { throw new StorageUnavailableError(); } },
  };
}

/** Bounded chunks, all in the protected store. Manifest committed last; never common-storage fallback. */
export function protectedStorage(store: AuthStorage, randomId: () => string): AuthStorage {
  type Manifest = { version: string; count: number };
  const manifest = async (key: string): Promise<Manifest | null> => {
    const raw = await store.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw) as Manifest;
    if (!/^[a-zA-Z0-9_-]+$/.test(value.version) || !Number.isInteger(value.count) || value.count < 1 || value.count > 256) throw new StorageUnavailableError();
    return value;
  };
  const removeChunks = async (key: string, m: Manifest | null) => {
    if (m) for (let i = 0; i < m.count; i++) await store.removeItem(`${key}.${m.version}.${i}`);
  };
  return {
    async getItem(key) {
      try {
        const m = await manifest(key); if (!m) return null;
        let result = '';
        for (let i = 0; i < m.count; i++) {
          const part = await store.getItem(`${key}.${m.version}.${i}`);
          if (part === null) throw new StorageUnavailableError();
          result += part;
        }
        return result;
      } catch { throw new StorageUnavailableError(); }
    },
    async setItem(key, value) {
      let next: Manifest | null = null;
      try {
        const old = await manifest(key);
        // 400 UTF-16 units <= 1600 UTF-8 bytes, below historical native limits.
        next = { version: randomId(), count: Math.max(1, Math.ceil(value.length / 400)) };
        if (next.count > 256) throw new StorageUnavailableError();
        for (let i = 0; i < next.count; i++) await store.setItem(`${key}.${next.version}.${i}`, value.slice(i * 400, (i + 1) * 400));
        await store.setItem(key, JSON.stringify(next));
        next = null;
        await removeChunks(key, old);
      } catch {
        if (next) await removeChunks(key, next).catch(() => {});
        throw new StorageUnavailableError();
      }
    },
    async removeItem(key) {
      try { const old = await manifest(key); await store.removeItem(key); await removeChunks(key, old); }
      catch { throw new StorageUnavailableError(); }
    },
  };
}
