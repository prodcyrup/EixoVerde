import type {
  HazardReport,
  RideSession,
  RouteRatingRecord,
  SavedPlace,
  SavedRoute,
  SyncOutboxItem,
  SyncTombstone,
  UserPreferences,
  VehicleSpec,
} from '../types';
import type { StorageAdapter } from './adapter';

export const DB_NAME = 'eixoverde_db_v1';
export const DB_VERSION = 5;
export const STORES = {
  routes: 'saved_routes',
  places: 'saved_places',
  vehicles: 'custom_vehicles',
  hazards: 'hazard_reports',
  rides: 'ride_sessions',
  ratings: 'route_ratings',
  meta: 'user_meta',
  outbox: 'sync_outbox',
  tombstones: 'sync_tombstones',
} as const;

const PREFS_KEY = 'eixoverde_prefs_v1';

// In-memory fallback for restricted private browsing or pure Node environments without IndexedDB
const memoryStores: Record<string, Map<string, unknown>> = {
  [STORES.routes]: new Map(),
  [STORES.places]: new Map(),
  [STORES.vehicles]: new Map(),
  [STORES.hazards]: new Map(),
  [STORES.rides]: new Map(),
  [STORES.ratings]: new Map(),
  [STORES.meta]: new Map(),
  [STORES.outbox]: new Map(),
  [STORES.tombstones]: new Map(),
};
let memoryPrefs: Partial<UserPreferences> = {};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      dbPromise = null;
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORES.routes)) {
          db.createObjectStore(STORES.routes, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.places)) {
          db.createObjectStore(STORES.places, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.vehicles)) {
          db.createObjectStore(STORES.vehicles, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.hazards)) {
          db.createObjectStore(STORES.hazards, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.rides)) {
          db.createObjectStore(STORES.rides, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.ratings)) {
          db.createObjectStore(STORES.ratings, { keyPath: 'routeId' });
        }
        if (!db.objectStoreNames.contains(STORES.meta)) {
          db.createObjectStore(STORES.meta);
        }
        if (!db.objectStoreNames.contains(STORES.outbox)) {
          db.createObjectStore(STORES.outbox, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.tombstones)) {
          db.createObjectStore(STORES.tombstones, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
      req.onblocked = () => {
        dbPromise = null;
        reject(new Error('IndexedDB open blocked'));
      };
    } catch (err) {
      dbPromise = null;
      reject(err);
    }
  });

  return dbPromise;
}

function getRecordKey(storeName: string, item: unknown): string {
  const obj = item as Record<string, unknown>;
  if (storeName === STORES.tombstones && typeof obj?.key === 'string') {
    return obj.key;
  }
  if (storeName === STORES.ratings && typeof obj?.routeId === 'string') {
    return obj.routeId;
  }
  if (typeof obj?.id === 'string') {
    return obj.id;
  }
  return String(Date.now());
}

async function getAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const mem = memoryStores[storeName];
    return mem ? (Array.from(mem.values()) as T[]) : [];
  }
}

async function putItem<T>(storeName: string, item: T): Promise<void> {
  const key = getRecordKey(storeName, item);
  memoryStores[storeName]?.set(key, item);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Graceful fallback to in-memory store
  }
}

async function removeItem(storeName: string, id: string): Promise<void> {
  memoryStores[storeName]?.delete(id);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Graceful no-op
  }
}

async function clearStore(storeName: string): Promise<void> {
  memoryStores[storeName]?.clear();
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Graceful no-op
  }
}

export interface ExtendedIndexedDbStorage extends StorageAdapter {
  getRouteRatings(): Promise<RouteRatingRecord[]>;
  saveRouteRating(record: RouteRatingRecord): Promise<void>;

  getOutboxItems(): Promise<SyncOutboxItem[]>;
  putOutboxItem(item: SyncOutboxItem): Promise<void>;
  removeOutboxItem(id: string): Promise<void>;
  clearOutbox(): Promise<void>;

  getTombstones(): Promise<SyncTombstone[]>;
  putTombstone(tombstone: SyncTombstone): Promise<void>;
  removeTombstone(key: string): Promise<void>;
  clearTombstones(): Promise<void>;

  getMeta<T = unknown>(key: string): Promise<T | null>;
  setMeta<T = unknown>(key: string, value: T): Promise<void>;
  deleteMeta(key: string): Promise<void>;

  resetForTests(): Promise<void>;
}

export const indexedDbStorage: ExtendedIndexedDbStorage = {
  async getSavedRoutes() {
    const items = await getAll<SavedRoute>(STORES.routes);
    return items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },
  async saveRoute(route) {
    await putItem(STORES.routes, route);
  },
  async deleteRoute(id) {
    await removeItem(STORES.routes, id);
  },

  async getSavedPlaces() {
    const items = await getAll<SavedPlace>(STORES.places);
    return items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },
  async savePlace(place) {
    await putItem(STORES.places, place);
  },
  async deletePlace(id) {
    await removeItem(STORES.places, id);
  },

  async getCustomVehicles() {
    return getAll<VehicleSpec>(STORES.vehicles);
  },
  async saveCustomVehicle(vehicle) {
    const now = new Date().toISOString();
    const enriched: VehicleSpec = {
      ...vehicle,
      createdAt: vehicle.createdAt || now,
      updatedAt: vehicle.updatedAt || now,
    };
    await putItem(STORES.vehicles, enriched);
  },
  async deleteCustomVehicle(id) {
    await removeItem(STORES.vehicles, id);
  },

  async getHazards() {
    const items = await getAll<HazardReport>(STORES.hazards);
    return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },
  async saveHazard(hazard) {
    const now = new Date().toISOString();
    const enriched: HazardReport = {
      ...hazard,
      createdAt: hazard.createdAt || now,
      updatedAt: hazard.updatedAt || hazard.createdAt || now,
    };
    await putItem(STORES.hazards, enriched);
  },
  async deleteHazard(id) {
    await removeItem(STORES.hazards, id);
  },

  async getRideSessions() {
    const items = await getAll<RideSession>(STORES.rides);
    return items.sort((a, b) => (b.startedAt || b.createdAt || '').localeCompare(a.startedAt || a.createdAt || ''));
  },
  async saveRideSession(ride) {
    const now = new Date().toISOString();
    const enriched: RideSession = {
      ...ride,
      createdAt: ride.createdAt || now,
      updatedAt: ride.updatedAt || now,
    };
    await putItem(STORES.rides, enriched);
  },
  async deleteRideSession(id) {
    await removeItem(STORES.rides, id);
  },

  async getRouteRatings() {
    return getAll<RouteRatingRecord>(STORES.ratings);
  },
  async saveRouteRating(record) {
    await putItem(STORES.ratings, {
      ...record,
      updatedAt: record.updatedAt || new Date().toISOString(),
    });
  },

  async getPreferences() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(PREFS_KEY);
        if (raw) {
          return JSON.parse(raw) as Partial<UserPreferences>;
        }
      }
    } catch {
      // Fall back to memoryPrefs
    }
    return { ...memoryPrefs };
  },
  async savePreferences(prefs) {
    const enriched: UserPreferences = {
      ...prefs,
      updatedAt: prefs.updatedAt || new Date().toISOString(),
    };
    memoryPrefs = enriched;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PREFS_KEY, JSON.stringify(enriched));
      }
    } catch {
      // Ignore quota errors
    }
  },

  async getOutboxItems() {
    const items = await getAll<SyncOutboxItem>(STORES.outbox);
    return items.sort((a, b) => (a.updatedAt || '').localeCompare(b.updatedAt || ''));
  },
  async putOutboxItem(item) {
    await putItem(STORES.outbox, item);
  },
  async removeOutboxItem(id) {
    await removeItem(STORES.outbox, id);
  },
  async clearOutbox() {
    await clearStore(STORES.outbox);
  },

  async getTombstones() {
    return getAll<SyncTombstone>(STORES.tombstones);
  },
  async putTombstone(tombstone) {
    await putItem(STORES.tombstones, tombstone);
  },
  async removeTombstone(key) {
    await removeItem(STORES.tombstones, key);
  },
  async clearTombstones() {
    await clearStore(STORES.tombstones);
  },

  async getMeta<T = unknown>(key: string): Promise<T | null> {
    try {
      const db = await openDB();
      return await new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(STORES.meta, 'readonly');
        const req = tx.objectStore(STORES.meta).get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return (memoryStores[STORES.meta]?.get(key) as T) ?? null;
    }
  },

  async setMeta<T = unknown>(key: string, value: T): Promise<void> {
    memoryStores[STORES.meta]?.set(key, value);
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.meta, 'readwrite');
        tx.objectStore(STORES.meta).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Graceful fallback
    }
  },

  async deleteMeta(key: string): Promise<void> {
    memoryStores[STORES.meta]?.delete(key);
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.meta, 'readwrite');
        tx.objectStore(STORES.meta).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Graceful fallback
    }
  },

  async resetForTests() {
    for (const map of Object.values(memoryStores)) {
      map.clear();
    }
    memoryPrefs = {};
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(PREFS_KEY);
      }
    } catch {
      // Ignore
    }
    if (dbPromise) {
      try {
        const db = await dbPromise;
        for (const storeName of Object.values(STORES)) {
          if (db.objectStoreNames.contains(storeName)) {
            await new Promise<void>((resolve) => {
              const tx = db.transaction(storeName, 'readwrite');
              tx.objectStore(storeName).clear();
              tx.oncomplete = () => resolve();
              tx.onerror = () => resolve();
            });
          }
        }
        db.close();
      } catch {
        // Ignore
      }
      dbPromise = null;
    }
  },
};
