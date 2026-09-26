/**
 * The reaction client — the only place the frontend talks to the reaction service.
 *
 * Contract (`docs/ux/06-reaction-shell.md` §1.4, §7.1–7.2, frozen by the service lane):
 *
 *   POST {REACTIONS_URL}/v1/reactions
 *     { chainId, propId, sessionStartedAt, venue, events: [{ id, reaction, offsetMs, actor }] }
 *     → { accepted, duplicates, rejected, rejectedReasons }
 *
 *   GET {REACTIONS_URL}/v1/reactions/:chainId/:propId
 *     → { chainId, propId, total, distinctReactors, activeReactors, totals, bucketMs,
 *         durationMs, buckets: [{ startMs, counts: number[6] }], hotspots, sessions, source }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE LOCAL FALLBACK IS A DOCUMENTED DEGRADATION, NOT A STUB.
 *
 * `NEXT_PUBLIC_REACTIONS_URL` selects the transport. When it is unset the client runs in
 * **local** mode: events are kept in `localStorage` on this device, the summary below is
 * computed here with the same shape the service returns, and every reader-facing surface
 * renders `source: 'local'` so nobody mistakes a device's own taps for the record.
 * This is what makes the rail and the band testable with no backend running, and it is
 * deliberately narrow: it counts only what this browser wrote, it can never see another
 * reader's reaction, and it deletes itself with the browser's storage.
 *
 * The local hotspot detector is a floor-checked reduction of `docs/media/02` §4, not the
 * service's detector: same floors (8 reactions / 5 reactors in 15 s, 10 active reactors,
 * z ≥ 4 against the preceding two minutes), Poisson baseline instead of the service's model.
 *
 * ONE THING THIS FILE DELIBERATELY DOES NOT DO: the tap timestamp is captured by the caller
 * at pointer-down and travels as `offsetMs` from the session start, so a slow network never
 * moves a reaction on the timeline. Nothing here reads the clock at send time.
 */

import { useEffect, useRef, useState } from "react";
import {
    VENUE_AGORA_ROOM,
    VENUE_IRL,
    VENUE_KICK,
    VENUE_TWITCH,
    VENUE_X_SPACES,
    VENUE_YOUTUBE_LIVE,
    type TaxonomyId,
} from "../helper/AgoraHelper";
import type { ReactionTimelineData } from "./agoraFixtures";

/**
 * The service's venue vocabulary, keyed by the numeric `VENUE_*` kind the app uses everywhere else.
 * The two must agree; the pairing is asserted by a test in the reaction service's own suite
 * (`services/agora-reactions/src/taxonomy.ts` lists the same six names).
 */
const VENUE_WIRE_NAMES: Record<number, string> = {
    [VENUE_KICK]: "kick",
    [VENUE_TWITCH]: "twitch",
    [VENUE_YOUTUBE_LIVE]: "youtube",
    [VENUE_X_SPACES]: "spaces",
    [VENUE_IRL]: "irl",
    [VENUE_AGORA_ROOM]: "agora",
};

export type ReactionSource = "service" | "local";

/** The stored bucket resolution: always 5 s (`docs/ux/02` §9.4). */
export const REACTION_BUCKET_MS = 5000;

/** The batch window: 500 ms, 50 events, or a pagehide — whichever comes first (§7.1). */
const FLUSH_MS = 500;
const FLUSH_AT = 50;
/** Two failed batches in a row is the "not reaching the record" state (§7.2). */
const UNREACHABLE_AFTER_FAILURES = 2;

/** A device store is not a database: older events are dropped past this, oldest first. */
const LOCAL_MAX_EVENTS = 2000;

const LOCAL_KEY_PREFIX = "agora.reactions.v1";

// ---------------------------------------------------------------------------
// Wire types
// ---------------------------------------------------------------------------

export interface ReactionEventInput {
    /** stable id — the same id is retried, and the service de-duplicates on it */
    id: string;
    /** 0..5, the fixed taxonomy (`TAXONOMIES`) */
    reaction: number;
    /** ms from the session start, captured at tap time */
    offsetMs: number;
    /** the reacting wallet */
    actor: string;
}

export interface ReactionBatch {
    chainId: number;
    propId: number | string;
    /** epoch ms of the session start; the anchor every `offsetMs` is measured from */
    sessionStartedAt: number;
    /** `VENUE_*` kind */
    venue: number;
    events: ReactionEventInput[];
}

export interface ReactionSubmitResult {
    accepted: number;
    duplicates: number;
    rejected: number;
    rejectedReasons: string[];
    source: ReactionSource;
}

export interface ReactionBucket {
    startMs: number;
    /** one entry per taxonomy, in taxonomy-id order */
    counts: number[];
}

export interface ReactionHotspot {
    atMs: number;
    /** the composition phrase, never a verdict (`docs/ux/06` §5.1) */
    label: string;
    reactions: number;
    distinctReactors: number;
    z: number;
}

export interface ReactionSession {
    startedAt?: number;
    endedAt?: number;
    venue?: number;
}

export interface ReactionSummary {
    chainId: number;
    propId: number;
    total: number;
    distinctReactors: number;
    /** distinct reactors inside the last five minutes of the session, as the service defines it */
    activeReactors: number;
    /** taxonomy id → count, as a string-keyed map, the way the service returns it */
    totals: Record<string, number>;
    bucketMs: number;
    durationMs: number;
    buckets: ReactionBucket[];
    hotspots: ReactionHotspot[];
    sessions: ReactionSession[];
    source: ReactionSource;
}

// ---------------------------------------------------------------------------
// The transport switch
// ---------------------------------------------------------------------------

/**
 * The service base URL, or `null` in local mode. `process.env.NEXT_PUBLIC_REACTIONS_URL` is
 * read literally so Next can inline it at build time — never through a dynamic key, and never
 * with a hostname fallback, for the same reason `NEXT_PUBLIC_EMBED_PARENT` has none: a
 * fallback that is right in preview and wrong in production is worse than an obvious absence.
 */
export const reactionsUrl = (): string | null => {
    const raw = process.env.NEXT_PUBLIC_REACTIONS_URL;
    if (typeof raw !== "string") {
        return null;
    }
    const trimmed = raw.trim().replace(/\/+$/, "");
    return trimmed.length > 0 ? trimmed : null;
};

export const reactionSource = (): ReactionSource => (reactionsUrl() ? "service" : "local");

// ---------------------------------------------------------------------------
// The local store
// ---------------------------------------------------------------------------

interface LocalRecord extends ReactionEventInput {
    at: number;
}

const localKey = (chainId: number, propId: number | string) => `${LOCAL_KEY_PREFIX}.${chainId}.${propId}`;

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readLocalEvents = (chainId: number, propId: number | string): LocalRecord[] => {
    if (!canUseStorage()) {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(localKey(chainId, propId));
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(
            (event): event is LocalRecord =>
                event && typeof event.id === "string" && typeof event.offsetMs === "number"
        );
    } catch {
        // A corrupt store is not a crash: it reads as empty and the next write replaces it.
        return [];
    }
};

const writeLocalEvents = (chainId: number, propId: number | string, events: LocalRecord[]) => {
    if (!canUseStorage()) {
        return;
    }
    try {
        const capped = events.length > LOCAL_MAX_EVENTS ? events.slice(events.length - LOCAL_MAX_EVENTS) : events;
        window.localStorage.setItem(localKey(chainId, propId), JSON.stringify(capped));
    } catch {
        // Quota exceeded or storage disabled: the reaction stays in the in-memory queue.
    }
};

/** One notification channel, so the rail and the band recompute from the same write. */
const listeners = new Map<string, Set<() => void>>();

const subscribeLocal = (key: string, listener: () => void) => {
    const set = listeners.get(key) ?? new Set();
    set.add(listener);
    listeners.set(key, set);
    return () => {
        set.delete(listener);
    };
};

const notifyLocal = (key: string) => {
    listeners.get(key)?.forEach((listener) => listener());
};

const appendLocalEvents = (chainId: number, propId: number | string, events: ReactionEventInput[]) => {
    const existing = readLocalEvents(chainId, propId);
    const seen = new Set(existing.map((event) => event.id));
    const at = Date.now();
    const fresh = events.filter((event) => !seen.has(event.id)).map((event) => ({ ...event, at }));
    writeLocalEvents(chainId, propId, [...existing, ...fresh]);
    notifyLocal(localKey(chainId, propId));
};

// ---------------------------------------------------------------------------
// The local summary — the same shape the service returns
// ---------------------------------------------------------------------------

const HOTSPOT_WINDOW_MS = 15_000;
const HOTSPOT_BASELINE_MS = 120_000;
const HOTSPOT_MIN_REACTIONS = 8;
const HOTSPOT_MIN_REACTORS = 5;
const HOTSPOT_MIN_ACTIVE_REACTORS = 10;
const HOTSPOT_Z = 4;
const ACTIVE_REACTOR_WINDOW_MS = 300_000;

/** `docs/ux/06` §5.1 — the fixed label set, keyed by dominant taxonomy. */
export const HOTSPOT_LABELS: Record<TaxonomyId, string> = {
    0: "Sources clustered here",
    1: "Marked compelling here",
    2: "Agreement clustered here",
    3: "Clarification asked here",
    4: "Disagreement clustered here",
    5: "Off-topic reactions clustered here",
};

const emptyCounts = (): number[] => [0, 0, 0, 0, 0, 0];

/** Poisson z: variance equals the mean, so a quiet window cannot divide by zero. */
const poissonZ = (observed: number, expected: number): number => {
    if (expected <= 0) {
        return observed > 0 ? HOTSPOT_Z + 1 : 0;
    }
    return (observed - expected) / Math.sqrt(expected);
};

const detectHotspots = (events: LocalRecord[], durationMs: number, bucketMs: number): ReactionHotspot[] => {
    if (events.length === 0) {
        return [];
    }

    const active = new Set<string>();
    const lastSeenAt = new Map<string, number>();
    events.forEach((event) => {
        const prev = lastSeenAt.get(event.actor) ?? -Infinity;
        lastSeenAt.set(event.actor, Math.max(prev, event.offsetMs));
    });
    const latest = events.reduce((max, event) => Math.max(max, event.offsetMs), 0);
    lastSeenAt.forEach((at, actor) => {
        if (latest - at <= ACTIVE_REACTOR_WINDOW_MS) {
            active.add(actor);
        }
    });
    if (active.size < HOTSPOT_MIN_ACTIVE_REACTORS) {
        return [];
    }

    const windowCounts = new Map<number, LocalRecord[]>();
    events.forEach((event) => {
        const index = Math.floor(event.offsetMs / HOTSPOT_WINDOW_MS);
        const list = windowCounts.get(index) ?? [];
        list.push(event);
        windowCounts.set(index, list);
    });

    const candidates: ReactionHotspot[] = [];
    for (let index = 0; index <= Math.floor(durationMs / HOTSPOT_WINDOW_MS); index += 1) {
        const window = windowCounts.get(index) ?? [];
        if (window.length < HOTSPOT_MIN_REACTIONS) {
            continue;
        }
        const reactors = new Set(window.map((event) => event.actor));
        if (reactors.size < HOTSPOT_MIN_REACTORS) {
            continue;
        }

        // The baseline is the preceding two minutes, excluding the window under test.
        const windowStart = index * HOTSPOT_WINDOW_MS;
        const baseline = events.filter(
            (event) =>
                event.offsetMs >= windowStart - HOTSPOT_BASELINE_MS && event.offsetMs < windowStart
        );
        const expected = (baseline.length / (HOTSPOT_BASELINE_MS / HOTSPOT_WINDOW_MS)) * 1;
        const z = poissonZ(window.length, expected);
        if (z < HOTSPOT_Z) {
            continue;
        }

        const totals = emptyCounts();
        window.forEach((event) => {
            totals[event.reaction] = (totals[event.reaction] ?? 0) + 1;
        });
        const dominant = totals.indexOf(Math.max(...totals)) as TaxonomyId;

        candidates.push({
            atMs: Math.floor(windowStart / bucketMs) * bucketMs,
            label: HOTSPOT_LABELS[dominant] ?? HOTSPOT_LABELS[0],
            reactions: window.length,
            distinctReactors: reactors.size,
            z,
        });
    }

    // Merge anything within 30 s and keep the strongest, so the list is moments, not windows.
    const merged: ReactionHotspot[] = [];
    candidates
        .sort((a, b) => a.atMs - b.atMs)
        .forEach((candidate) => {
            const previous = merged[merged.length - 1];
            if (previous && candidate.atMs - previous.atMs <= 30_000) {
                if (candidate.z > previous.z) {
                    merged[merged.length - 1] = candidate;
                }
                return;
            }
            merged.push(candidate);
        });

    return merged.slice(0, 8);
};

export const summariseLocal = (
    chainId: number,
    propId: number | string,
    events: LocalRecord[],
    bucketMs = REACTION_BUCKET_MS
): ReactionSummary => {
    const highest = events.reduce((max, event) => Math.max(max, event.offsetMs), 0);
    const durationMs = highest === 0 ? 0 : Math.ceil((highest + 1) / bucketMs) * bucketMs;
    const bucketCount = Math.ceil(durationMs / bucketMs);

    const totals = emptyCounts();
    const reactors = new Set<string>();
    const buckets: ReactionBucket[] = Array.from({ length: bucketCount }, (_, index) => ({
        startMs: index * bucketMs,
        counts: emptyCounts(),
    }));

    events.forEach((event) => {
        totals[event.reaction] = (totals[event.reaction] ?? 0) + 1;
        reactors.add(event.actor);
        const index = Math.min(bucketCount - 1, Math.floor(event.offsetMs / bucketMs));
        const bucket = buckets[index];
        if (bucket) {
            bucket.counts[event.reaction] = (bucket.counts[event.reaction] ?? 0) + 1;
        }
    });

    const latest = events.reduce((max, event) => Math.max(max, event.offsetMs), 0);
    const activeReactors = new Set(
        events.filter((event) => latest - event.offsetMs <= ACTIVE_REACTOR_WINDOW_MS).map((event) => event.actor)
    );

    const totalsMap: Record<string, number> = {};
    totals.forEach((count, id) => {
        totalsMap[String(id)] = count;
    });

    return {
        chainId,
        propId: Number(propId),
        total: events.length,
        distinctReactors: reactors.size,
        activeReactors: activeReactors.size,
        totals: totalsMap,
        bucketMs,
        durationMs,
        buckets,
        hotspots: detectHotspots(events, durationMs, bucketMs),
        sessions: [],
        source: "local",
    };
};

const mapServiceSummary = (raw: any, chainId: number, propId: number | string): ReactionSummary => {
    const buckets: ReactionBucket[] = Array.isArray(raw?.buckets)
        ? raw.buckets.map((bucket: any) => ({
              startMs: Number(bucket?.startMs ?? 0),
              counts: emptyCounts().map((_, index) => Number(bucket?.counts?.[index] ?? 0)),
          }))
        : [];

    return {
        chainId: Number(raw?.chainId ?? chainId),
        propId: Number(raw?.propId ?? propId),
        total: Number(raw?.total ?? 0),
        distinctReactors: Number(raw?.distinctReactors ?? 0),
        activeReactors: Number(raw?.activeReactors ?? 0),
        totals: (raw?.totals ?? {}) as Record<string, number>,
        bucketMs: Number(raw?.bucketMs ?? REACTION_BUCKET_MS),
        durationMs: Number(raw?.durationMs ?? 0),
        buckets,
        hotspots: Array.isArray(raw?.hotspots)
            ? raw.hotspots.map((hotspot: any) => ({
                  atMs: Number(hotspot?.atMs ?? 0),
                  label: String(hotspot?.label ?? ""),
                  reactions: Number(hotspot?.reactions ?? 0),
                  distinctReactors: Number(hotspot?.distinctReactors ?? 0),
                  z: Number(hotspot?.z ?? 0),
              }))
            : [],
        sessions: Array.isArray(raw?.sessions) ? raw.sessions : [],
        source: "service",
    };
};

// ---------------------------------------------------------------------------
// submitReactions
// ---------------------------------------------------------------------------

/**
 * One batch, one request. In local mode the batch is appended to this device's store instead,
 * with the same de-duplication on `id` that the service performs.
 *
 * Throws on a transport failure so the caller can retry the same ids once; a batch the service
 * refuses is a resolved value carrying `rejectedReasons`.
 */
export const submitReactions = async (batch: ReactionBatch): Promise<ReactionSubmitResult> => {
    const base = reactionsUrl();

    if (!base) {
        appendLocalEvents(batch.chainId, batch.propId, batch.events);
        return {
            accepted: batch.events.length,
            duplicates: 0,
            rejected: 0,
            rejectedReasons: [],
            source: "local",
        };
    }

    // The service's wire contract wants an ISO-8601 instant and a venue *name*; the internal batch
    // carries epoch ms and the numeric `VENUE_*` kind. The conversion happens here and only here —
    // the rest of the module reasons in numbers, and the boundary is the single place that has to
    // know the service's vocabulary.
    //
    // Sending the internal shape was a real defect, not a hypothetical one: the service rejects
    // *every event in the batch* with `INVALID_SESSION_STARTED_AT`, verified against the running
    // service, so every tap was silently lost while the UI reported success.
    const response = await fetch(`${base}/v1/reactions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            chainId: batch.chainId,
            propId: batch.propId,
            sessionStartedAt: new Date(batch.sessionStartedAt).toISOString(),
            venue: VENUE_WIRE_NAMES[batch.venue] ?? "agora",
            events: batch.events,
        }),
    });

    if (!response.ok) {
        throw new Error(`reaction service responded ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    return {
        accepted: Number(data?.accepted ?? 0),
        duplicates: Number(data?.duplicates ?? 0),
        rejected: Number(data?.rejected ?? 0),
        rejectedReasons: Array.isArray(data?.rejectedReasons) ? data.rejectedReasons.map(String) : [],
        source: "service",
    };
};

// ---------------------------------------------------------------------------
// Server-side sentences for the reasons the service returns
// ---------------------------------------------------------------------------

/**
 * A refusal is always a sentence the reader can act on, and a provider enum is never rendered
 * (`docs/ux/06` §7.2, copy deck §9.7).
 */
export const rejectionSentence = (reason: string | undefined): string => {
    switch (reason) {
        case "RATE_LIMITED":
            return "Too many reactions. Try again in a minute.";
        case "BUCKET_CAP":
            return "Up to 3 reactions per moment.";
        case "DUPLICATE_TOGGLED":
            return "";
        case "OUT_OF_WINDOW":
        case "CLOSED":
            return "The reaction window for this session is closed.";
        case "ANCHOR_MISSING":
            return "Pick a moment first.";
        default:
            return "Your reaction was not saved. Try again.";
    }
};

// ---------------------------------------------------------------------------
// The session clock
// ---------------------------------------------------------------------------

export type AnchorSync = "exact" | "measured" | "estimated";

export interface SessionAnchor {
    /** the moment a tap lands on, in ms from the session start */
    tOffsetMs: number;
    sync: AnchorSync;
    /** the venue's own half-width; 0 only when the clock is ours */
    uncertaintyMs: number;
}

/** The one conversion from a wall clock to a session moment. Times may be negative: before a start. */
export const sessionAnchorAt = (
    tapMs: number,
    sessionStartedAtMs: number,
    sync: AnchorSync,
    uncertaintyMs: number
): SessionAnchor => ({
    tOffsetMs: tapMs - sessionStartedAtMs,
    sync,
    uncertaintyMs,
});

/** The 5 s bucket a moment belongs to — the unit of the cap and of a toggle. */
export const bucketIndexFor = (offsetMs: number, bucketMs = REACTION_BUCKET_MS): number =>
    Math.floor(offsetMs / bucketMs);

// ---------------------------------------------------------------------------
// The tap writer
// ---------------------------------------------------------------------------

export type ReactionWriteState =
    | "idle"
    | "queued"
    | "offline"
    | "service-unreachable"
    | "refused";

export interface ReactionSubmitHandle {
    /**
     * Register one reaction at one moment and return its event id. `tapMs` is captured at
     * pointer-down by the caller; nothing here reads the clock at send time.
     */
    tap: (reaction: TaxonomyId, tapMs?: number, actor?: string) => string;
    /** Undo a tap that has not left the batch window yet. Returns false once it has been sent. */
    untap: (id: string) => boolean;
    /** Events waiting on this device, unsent. Never rendered as a number in the rail. */
    queued: number;
    writeState: ReactionWriteState;
    /** the sentence for the current write state, or null when there is nothing to say */
    sentence: string | null;
    source: ReactionSource;
}

export interface ReactionSubmitOptions {
    /** the reacting wallet; in local mode this is what makes `distinctReactors` mean anything */
    actor?: string;
}

/**
 * The tap writer for one session. The queue lives here, not in the rail, so a tap that arrives
 * while a batch is in flight is not lost.
 */
export const useReactionSubmit = (
    chainId: number,
    propId: number | string,
    sessionStartedAt: number,
    venue: number,
    options: ReactionSubmitOptions = {}
): ReactionSubmitHandle => {
    const actor = options.actor ?? "";
    const queue = useRef<ReactionEventInput[]>([]);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlight = useRef(false);
    const failures = useRef(0);
    const [queued, setQueued] = useState(0);
    const [writeState, setWriteState] = useState<ReactionWriteState>("idle");
    const [sentence, setSentence] = useState<string | null>(null);
    const source: ReactionSource = reactionsUrl() ? "service" : "local";

    const flush = useRef<() => void>(() => undefined);

    flush.current = () => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        if (inFlight.current || queue.current.length === 0) {
            return;
        }
        const events = queue.current;
        queue.current = [];
        setQueued(queue.current.length);
        const offline = typeof navigator !== "undefined" && navigator.onLine === false;
        inFlight.current = true;
        setWriteState(offline ? "offline" : "queued");

        submitReactions({ chainId, propId, sessionStartedAt, venue, events })
            .then((result) => {
                failures.current = 0;
                const refusal = result.rejectedReasons.map(rejectionSentence).find((text) => text);
                if (refusal) {
                    setWriteState("refused");
                    setSentence(refusal);
                } else {
                    setWriteState("idle");
                    setSentence(null);
                }
            })
            .catch(() => {
                // Retry once with the same ids; the service de-duplicates, so a batch that
                // crossed the wire and lost its response does not double-count.
                failures.current += 1;
                submitReactions({ chainId, propId, sessionStartedAt, venue, events })
                    .then(() => {
                        failures.current = 0;
                        setWriteState("idle");
                        setSentence(null);
                    })
                    .catch(() => {
                        failures.current += 1;
                        // Nothing is dropped: the events return to the queue and are retried on
                        // the next tap, the next flush, or the next page visit.
                        queue.current = [...events, ...queue.current];
                        setQueued(queue.current.length);
                        setWriteState(failures.current >= UNREACHABLE_AFTER_FAILURES ? "service-unreachable" : "offline");
                        setSentence(
                            source === "local"
                                ? "Kept on this device. Will be sent when you are back."
                                : "Reactions are not reaching the record right now. They are stored on this device until the connection returns."
                        );
                    });
            })
            .finally(() => {
                inFlight.current = false;
            });
    };

    const tap = (reaction: TaxonomyId, tapMs?: number, tapActor?: string): string => {
        const at = typeof tapMs === "number" ? tapMs : Date.now();
        const offsetMs = Math.max(0, at - sessionStartedAt);
        const id = `${chainId}-${propId}-${offsetMs}-${reaction}-${Math.random().toString(36).slice(2, 10)}`;
        queue.current = [
            ...queue.current,
            { id, reaction, offsetMs, actor: tapActor ?? actor },
        ];
        setQueued(queue.current.length);
        if (queue.current.length >= FLUSH_AT) {
            flush.current();
            return id;
        }
        if (!timer.current) {
            timer.current = setTimeout(() => flush.current(), FLUSH_MS);
        }
        return id;
    };

    /**
     * A second tap in the same bucket toggles the chip off. While the event is still in the
     * batch window nothing was sent, so removing it here is exactly what the reader sees. Once a
     * batch has been sent, the frozen service contract has no tombstone field to remove it with,
     * so the chip clears locally and `sentence` says so rather than implying a deletion.
     */
    const untap = (id: string): boolean => {
        const index = queue.current.findIndex((event) => event.id === id);
        if (index >= 0) {
            queue.current = queue.current.filter((event) => event.id !== id);
            setQueued(queue.current.length);
            return true;
        }
        setSentence("The reaction was already sent. The reaction service cannot remove a reaction yet.");
        return false;
    };

    useEffect(() => {
        const onPageHide = () => flush.current();
        window.addEventListener("pagehide", onPageHide);
        return () => {
            window.removeEventListener("pagehide", onPageHide);
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, []);

    return { tap, untap, queued, writeState, sentence, source };
};

// ---------------------------------------------------------------------------
// The summary reader
// ---------------------------------------------------------------------------

export interface ReactionSummaryState {
    summary: ReactionSummary | null;
    isLoading: boolean;
    isError: boolean;
    source: ReactionSource;
    refetch: () => void;
}

/**
 * The summary for one discussion. In local mode it is read-and-recomputed from this device's
 * store, and it re-reads itself whenever this tab writes another batch.
 */
export const useReactionSummary = (
    chainId: number,
    propId: number | string | undefined,
    options: { enabled?: boolean; pollMs?: number } = {}
): ReactionSummaryState => {
    const enabled = (options.enabled ?? true) && propId !== undefined && propId !== null;
    const pollMs = options.pollMs ?? 0;
    const base = reactionsUrl();
    const [summary, setSummary] = useState<ReactionSummary | null>(null);
    const [isLoading, setLoading] = useState<boolean>(enabled);
    const [isError, setError] = useState(false);
    const [tick, setTick] = useState(0);

    const refetch = () => setTick((prev) => prev + 1);

    useEffect(() => {
        if (!enabled || propId === undefined || propId === null) {
            setSummary(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            if (!base) {
                const events = readLocalEvents(chainId, propId);
                if (!cancelled) {
                    setSummary(summariseLocal(chainId, propId, events));
                    setError(false);
                    setLoading(false);
                }
                return;
            }
            try {
                const response = await fetch(`${base}/v1/reactions/${chainId}/${propId}`);
                if (!response.ok) {
                    throw new Error(`reaction service responded ${response.status}`);
                }
                const raw = await response.json();
                if (!cancelled) {
                    setSummary(mapServiceSummary(raw, chainId, propId));
                    setError(false);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        load();

        const unsubscribe: () => void = base
            ? () => undefined
            : subscribeLocal(localKey(chainId, propId), () => {
                  setSummary(summariseLocal(chainId, propId, readLocalEvents(chainId, propId)));
              });

        const interval = pollMs > 0 ? setInterval(load, pollMs) : null;

        return () => {
            cancelled = true;
            unsubscribe();
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [chainId, propId, base, enabled, pollMs, tick]);

    return { summary, isLoading, isError, source: base ? "service" : "local", refetch };
};

// ---------------------------------------------------------------------------
// The band's data
// ---------------------------------------------------------------------------

export interface TimelineDataOptions {
    title: string;
    sessionIndex?: number;
    /** the lane's name; the frozen service contract carries no diarization, so there is one lane */
    laneLabel?: string;
    /** the session's end, when it is known, so the reaction window can be stated */
    sessionEndedAt?: number | null;
    reactionWindowDays?: number;
}

/**
 * The service summary → the band's prop. Two deliberate mappings, both because the frozen
 * summary carries less than the fixture did:
 *
 *  - **One lane.** The service returns per-bucket, per-taxonomy counts with no speaker
 *    attribution, and speaker lanes need diarization (`docs/ux/06` §5.2). Inventing a lane
 *    name per speaker would be a fabrication, so the band shows one lane and says so.
 *  - **No digest, no verification claim.** Individual reactions are not on chain and the
 *    service reports neither a digest nor a verified share, so `digest.anchored` is false
 *    (the band omits its anchor line) and `verifiedShare` suppresses the banner rather than
 *    asserting it either way. The page states the position in words instead.
 */
export const toTimelineData = (
    summary: ReactionSummary,
    options: TimelineDataOptions
): ReactionTimelineData => {
    const windowDays = options.reactionWindowDays ?? 14;
    const endedAt = options.sessionEndedAt ?? null;
    const laneLabel = options.laneLabel ?? "All participants";

    return {
        propId: summary.propId,
        chainId: summary.chainId,
        title: options.title,
        sessionIndex: options.sessionIndex ?? 0,
        durationMs: summary.durationMs,
        bucketMs: summary.bucketMs,
        lanes: [
            {
                id: "all",
                label: laneLabel,
                rosterIndex: 0,
                buckets: summary.buckets.map((bucket, index) => ({
                    bucketIndex: index,
                    startMs: bucket.startMs,
                    n: bucket.counts.reduce((sum, count) => sum + count, 0),
                    series: {
                        live: Object.fromEntries(
                            bucket.counts
                                .map((count, id) => [String(id), count] as const)
                                .filter(([, count]) => count > 0)
                        ) as Partial<Record<TaxonomyId, number>>,
                        post: {} as Partial<Record<TaxonomyId, number>>,
                    },
                })),
            },
        ],
        events: [],
        summary: {
            totalReactions: summary.total,
            totalReactors: summary.distinctReactors,
            verifiedReactors: 0,
            verifiedShare: 1,
            lateArrival: 0,
            reactionWindowDays: windowDays,
            windowOpensAt: endedAt ? Math.floor(endedAt / 1000) : 0,
            windowClosesAt: endedAt ? Math.floor(endedAt / 1000) + windowDays * 24 * 60 * 60 : 0,
            sealed: false,
            digest: { sha256: "", anchored: false, anchoredAt: 0 },
        },
    };
};

/** True while the summary is too thin to be shown as a signal (`docs/ux/06` §3.2). */
export const poolStateOf = (summary: ReactionSummary | null): "empty" | "thin" | "normal" => {
    const total = summary?.total ?? 0;
    if (total === 0) {
        return "empty";
    }
    return total < 10 ? "thin" : "normal";
};
