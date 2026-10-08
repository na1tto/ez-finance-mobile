import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { browserStorage, protectedStorage, StorageUnavailableError, trackedStorage } from './storage';

// The SDK needs WebCrypto-shaped SHA-256/randomness for PKCE. Expo provides
// native crypto, but not a complete WebCrypto global on every RN runtime.
if (Platform.OS !== 'web' && !globalThis.crypto?.subtle) {
  const nativeCrypto = {
    getRandomValues: Crypto.getRandomValues,
    randomUUID: Crypto.randomUUID,
    subtle: { digest: (algorithm: string, data: BufferSource) => {
      if (algorithm !== 'SHA-256') throw new Error('Algoritmo não suportado pelo adapter PKCE.');
      return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
    } },
  };
  Object.defineProperty(globalThis, 'crypto', { value: nativeCrypto, configurable: true });
}

export const authStorage = trackedStorage(Platform.OS === 'web'
  ? browserStorage(() => {
      // Static rendering never authenticates; client hydration uses real persistent storage.
      if (typeof window === 'undefined') return { getItem: () => null, setItem: () => { throw new StorageUnavailableError(); }, removeItem: () => {} };
      return window.localStorage;
    })
  : protectedStorage({
      getItem: key => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
      removeItem: key => SecureStore.deleteItemAsync(key),
    }, () => Crypto.randomUUID()));

export const randomAttemptId = () => Crypto.randomUUID();

export const callbackBase = () => Platform.OS === 'web' ? window.location.origin : 'ezfinance://';
export const callbackUrl = (path: 'callback' | 'reset-password') => Platform.OS === 'web'
  ? `${callbackBase()}/auth/${path}` : `ezfinance://auth/${path}`;

export async function serializeAuth<T>(key: string, task: () => Promise<T>): Promise<T> {
  if (Platform.OS === 'web') {
    if (!navigator.locks) throw new Error('Este navegador não permite coordenar a autenticação entre abas. Use um navegador atualizado.');
    return navigator.locks.request(`${key}.operation`, task);
  }
  // Native runtime has only one Auth controller. UI/service busy flag prevents overlap.
  return task();
}

export async function openGoogle(url: string, redirect: string, complete: (url: string) => Promise<void>) {
  if (Platform.OS === 'web') { window.location.assign(url); return true; }
  const result = await WebBrowser.openAuthSessionAsync(url, redirect);
  if (result.type === 'success') { await complete(result.url); return true; }
  return false;
}
