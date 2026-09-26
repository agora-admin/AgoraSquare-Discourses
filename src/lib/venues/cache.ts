/**
 * A tiny TTL cache for presence lookups.
 *
 * Why it exists rather than being inlined into each client: a discussion page can be open on
 * several tabs, and both platforms rate-limit. Two clients each rolling their own cache would
 * double the request rate for no benefit, and a cache inside the React hook would not help at all,
 * because every browser holds its own copy — the requests still reach the platform.
 *
 * Server-side, module scope, deliberately in-memory: this is a politeness measure, not a datastore.
 * It is per-process and must never be treated as correct across instances.
 */

interface Entry<T> {
    readonly value: T;
    readonly expiresAt: number;
}

export interface TtlCache<T> {
    get(key: string, now: number): T | undefined;
    set(key: string, value: T, now: number): void;
    /** For tests. */
    clear(): void;
}

export const createTtlCache = <T>(ttlMs: number, maxEntries = 500): TtlCache<T> => {
    const entries = new Map<string, Entry<T>>();

    return {
        get(key, now) {
            const hit = entries.get(key);
            if (!hit) return undefined;
            if (hit.expiresAt <= now) {
                entries.delete(key);
                return undefined;
            }
            return hit.value;
        },
        set(key, value, now) {
            // Bounded, so a hostile caller cannot grow the map without limit by inventing channels.
            if (entries.size >= maxEntries) {
                const oldest = entries.keys().next();
                if (!oldest.done) entries.delete(oldest.value);
            }
            entries.set(key, { value, expiresAt: now + ttlMs });
        },
        clear() {
            entries.clear();
        },
    };
};

/**
 * Run `fn` at most once per key per TTL window, sharing the in-flight promise.
 *
 * Two tabs opening the same page at the same moment must produce one upstream request, not two —
 * caching only the *result* would still let both through.
 */
export const createSingleFlight = <T>(cache: TtlCache<T>) => {
    const inFlight = new Map<string, Promise<T>>();

    return async (key: string, now: () => number, fn: () => Promise<T>): Promise<T> => {
        const cached = cache.get(key, now());
        if (cached !== undefined) return cached;

        const pending = inFlight.get(key);
        if (pending) return pending;

        const promise = fn()
            .then((value) => {
                cache.set(key, value, now());
                return value;
            })
            .finally(() => {
                inFlight.delete(key);
            });

        inFlight.set(key, promise);
        return promise;
    };
};
