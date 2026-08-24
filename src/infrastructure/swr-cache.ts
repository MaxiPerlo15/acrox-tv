type CacheEntry<T> = {
  value: T;
  updatedAt: number;
  expiresAt: number;
  staleUntil: number;
};

type CacheState = "fresh" | "stale" | "revalidated" | "snapshot";

export type SWRResult<T> = {
  value: T;
  state: CacheState;
  updatedAt: number;
};

type SWRGetParams<T> = {
  key: string;
  ttlMs: number;
  staleMs: number;
  load: () => Promise<T>;
  now?: () => number;
  shouldRefresh?: (ctx: { now: number; entry: CacheEntry<T> }) => boolean;
};

export type SWRStore = {
  get<T>(key: string): CacheEntry<T> | undefined;
  set<T>(key: string, entry: CacheEntry<T>): void;
  getSnapshot<T>(key: string): T | undefined;
  setSnapshot<T>(key: string, value: T): void;
  getInFlight<T>(key: string): Promise<T> | undefined;
  setInFlight<T>(key: string, promise: Promise<T>): void;
  clearInFlight(key: string): void;
};

class MemorySWRStore implements SWRStore {
  private readonly entries = new Map<string, CacheEntry<unknown>>();
  private readonly snapshots = new Map<string, unknown>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.entries.get(key);
    return entry as CacheEntry<T> | undefined;
  }

  set<T>(key: string, entry: CacheEntry<T>) {
    this.entries.set(key, entry as CacheEntry<unknown>);
  }

  getSnapshot<T>(key: string): T | undefined {
    return this.snapshots.get(key) as T | undefined;
  }

  setSnapshot<T>(key: string, value: T) {
    this.snapshots.set(key, value as unknown);
  }

  getInFlight<T>(key: string): Promise<T> | undefined {
    return this.inFlight.get(key) as Promise<T> | undefined;
  }

  setInFlight<T>(key: string, promise: Promise<T>) {
    this.inFlight.set(key, promise as Promise<unknown>);
  }

  clearInFlight(key: string) {
    this.inFlight.delete(key);
  }
}

export const createSWRStore = (): SWRStore => new MemorySWRStore();

const defaultStore = createSWRStore();

const persistValue = <T>(
  store: SWRStore,
  key: string,
  value: T,
  ttlMs: number,
  staleMs: number,
  now: () => number
) => {
  const updatedAt = now();
  store.set<T>(key, {
    value,
    updatedAt,
    expiresAt: updatedAt + ttlMs,
    staleUntil: updatedAt + staleMs
  });
  store.setSnapshot(key, value);
};

const loadWithSingleFlight = async <T>(
  store: SWRStore,
  key: string,
  ttlMs: number,
  staleMs: number,
  load: () => Promise<T>,
  now: () => number
) => {
  const existing = store.getInFlight<T>(key);
  if (existing) {
    return existing;
  }

  const promise = load()
    .then((value) => {
      persistValue(store, key, value, ttlMs, staleMs, now);
      return value;
    })
    .finally(() => {
      store.clearInFlight(key);
    });

  store.setInFlight(key, promise);
  return promise;
};

export const getSWRResource = async <T>(
  params: SWRGetParams<T>,
  store: SWRStore = defaultStore
): Promise<SWRResult<T>> => {
  const { key, ttlMs, staleMs, load, now = Date.now, shouldRefresh } = params;
  const currentTime = now();
  const entry = store.get<T>(key);

  if (entry && currentTime <= entry.expiresAt) {
    return { value: entry.value, state: "fresh", updatedAt: entry.updatedAt };
  }

  if (entry && currentTime <= entry.staleUntil) {
    const refreshAllowed = shouldRefresh ? shouldRefresh({ now: currentTime, entry }) : true;
    if (refreshAllowed && !store.getInFlight(key)) {
      void loadWithSingleFlight(store, key, ttlMs, staleMs, load, now).catch(() => {
        // stale data is already returned; refresh failures are tolerated here.
      });
    }
    return { value: entry.value, state: "stale", updatedAt: entry.updatedAt };
  }

  try {
    const loaded = await loadWithSingleFlight(store, key, ttlMs, staleMs, load, now);
    return { value: loaded, state: "revalidated", updatedAt: store.get<T>(key)!.updatedAt };
  } catch (error) {
    const snapshot = store.getSnapshot<T>(key);
    if (snapshot !== undefined && entry) {
      return { value: snapshot, state: "snapshot", updatedAt: entry.updatedAt };
    }
    throw error;
  }
};
