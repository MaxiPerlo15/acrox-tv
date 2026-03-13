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
};

type SWRGetParams<T> = {
  key: string;
  ttlMs: number;
  staleMs: number;
  load: () => Promise<T>;
  shouldRefresh?: (ctx: { now: number; entry: CacheEntry<T> }) => boolean;
};

type SWRStore = {
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

const defaultStore = new MemorySWRStore();

const persistValue = <T>(store: SWRStore, key: string, value: T, ttlMs: number, staleMs: number) => {
  const now = Date.now();
  store.set<T>(key, {
    value,
    updatedAt: now,
    expiresAt: now + ttlMs,
    staleUntil: now + staleMs
  });
  store.setSnapshot(key, value);
};

const loadWithSingleFlight = async <T>(
  store: SWRStore,
  key: string,
  ttlMs: number,
  staleMs: number,
  load: () => Promise<T>
) => {
  const existing = store.getInFlight<T>(key);
  if (existing) {
    return existing;
  }

  const promise = load()
    .then((value) => {
      persistValue(store, key, value, ttlMs, staleMs);
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
  const { key, ttlMs, staleMs, load, shouldRefresh } = params;
  const now = Date.now();
  const entry = store.get<T>(key);

  if (entry && now <= entry.expiresAt) {
    return { value: entry.value, state: "fresh" };
  }

  if (entry && now <= entry.staleUntil) {
    const refreshAllowed = shouldRefresh ? shouldRefresh({ now, entry }) : true;
    if (refreshAllowed && !store.getInFlight(key)) {
      void loadWithSingleFlight(store, key, ttlMs, staleMs, load).catch(() => {
        // stale data is already returned; refresh failures are tolerated here.
      });
    }
    return { value: entry.value, state: "stale" };
  }

  try {
    const loaded = await loadWithSingleFlight(store, key, ttlMs, staleMs, load);
    return { value: loaded, state: "revalidated" };
  } catch (error) {
    const snapshot = store.getSnapshot<T>(key);
    if (snapshot !== undefined) {
      return { value: snapshot, state: "snapshot" };
    }
    throw error;
  }
};
