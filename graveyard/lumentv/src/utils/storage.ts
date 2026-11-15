import type { EpgDataset, StoredPlaylist, UserPreferences } from '../types/iptv';

const DB_NAME = 'lumentv_local_db';
const DB_VERSION = 1;
const STORE_PLAYLISTS = 'playlists';
const STORE_EPG = 'epg';
const EPG_RECORD_KEY = 'active_epg';
const PREFS_KEY = 'lumentv_preferences_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  activePlaylistId: '',
  activeChannelId: null,
  favoriteIds: [],
  recentIds: [],
  volume: 0.85,
  muted: false,
  epgDrawerOpen: true,
  sidebarCollapsed: false,
  customUserAgent: '',
  useLocalRelay: false,
  corsProxyUrl: '',
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this browser.'));
      return;
    }

    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Timed out opening local IndexedDB storage.'));
      }
    }, 2000);

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
          db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'meta.id' });
        }
        if (!db.objectStoreNames.contains(STORE_EPG)) {
          db.createObjectStore(STORE_EPG);
        }
      };
      request.onsuccess = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeoutId);
          resolve(request.result);
        }
      };
      request.onerror = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeoutId);
          reject(request.error || new Error('Failed to open local database'));
        }
      };
      request.onblocked = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeoutId);
          reject(new Error('Local database access was blocked.'));
        }
      };
    } catch (err) {
      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
        reject(err);
      }
    }
  });
}

export async function loadAllPlaylists(): Promise<StoredPlaylist[]> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PLAYLISTS, 'readonly');
      const store = tx.objectStore(STORE_PLAYLISTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as StoredPlaylist[]) || [];
        list.sort((a, b) => b.meta.createdAt - a.meta.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function savePlaylist(playlist: StoredPlaylist): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PLAYLISTS, 'readwrite');
      const store = tx.objectStore(STORE_PLAYLISTS);
      const req = store.put(playlist);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Allow app to keep running in memory if browser storage is restricted
  }
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PLAYLISTS, 'readwrite');
      const store = tx.objectStore(STORE_PLAYLISTS);
      const req = store.delete(playlistId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore storage errors
  }
}

export async function loadActiveEpg(): Promise<EpgDataset | null> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EPG, 'readonly');
      const store = tx.objectStore(STORE_EPG);
      const req = store.get(EPG_RECORD_KEY);
      req.onsuccess = () => resolve((req.result as EpgDataset) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveActiveEpg(dataset: EpgDataset): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_EPG, 'readwrite');
      const store = tx.objectStore(STORE_EPG);
      const req = store.put(dataset, EPG_RECORD_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Allow app to keep running in memory if browser storage is restricted
  }
}

export async function clearActiveEpg(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_EPG, 'readwrite');
      const store = tx.objectStore(STORE_EPG);
      const req = store.delete(EPG_RECORD_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore storage errors
  }
}

export async function clearAllLocalData(): Promise<void> {
  try {
    localStorage.removeItem(PREFS_KEY);
  } catch {
    // ignore storage errors
  }
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_PLAYLISTS, STORE_EPG], 'readwrite');
      tx.objectStore(STORE_PLAYLISTS).clear();
      tx.objectStore(STORE_EPG).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore storage errors
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      favoriteIds: Array.isArray(parsed.favoriteIds) ? parsed.favoriteIds : [],
      recentIds: Array.isArray(parsed.recentIds) ? parsed.recentIds : [],
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}
