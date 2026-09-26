/**
 * Venue presence — the normalized answer to one question: *is this channel live?*
 *
 * The rest of the app never learns which platform answered. Twitch and Kick disagree on
 * everything — auth, field names, how "live" is even represented — so those disagreements are
 * confined to their own clients and normalised here.
 *
 * No I/O and no React in this file. It is the vocabulary the clients, the route and the hook all
 * share, so a change to a platform's shape cannot ripple past its own client.
 */

/** What we can honestly say about a channel. */
export type PresenceState =
    /** The platform says a stream is running now. */
    | "live"
    /** The platform says it is not. */
    | "offline"
    /** We could not ask, or could not understand the answer. Never presented as "offline". */
    | "unknown";

/** Which platform answered, so the UI can attribute the observation rather than assert it. */
export type PresenceSourceId = "twitch-helix" | "kick-public" | "none";

export interface VenuePresence {
    readonly state: PresenceState;
    /** Epoch ms the broadcaster went live, or `null` when offline or unknown. */
    readonly startedAt: number | null;
    /** Who answered. `none` whenever `state` is `unknown`. */
    readonly source: PresenceSourceId;
    /** Epoch ms this was observed. The UI shows staleness from this, never from `Date.now()`. */
    readonly observedAt: number;
    /** Display-only. Absent is normal and must never be rendered as zero. */
    readonly viewerCount?: number | null;
    readonly title?: string | null;
    /** Why the state is `unknown`. Shown to the reader verbatim when it is. */
    readonly reason?: string;
}

/** The smallest honest answer when we cannot observe anything. */
export const unknownPresence = (reason: string, now: number): VenuePresence => ({
    state: "unknown",
    startedAt: null,
    source: "none",
    observedAt: now,
    reason,
});

export const offlinePresence = (source: PresenceSourceId, now: number): VenuePresence => ({
    state: "offline",
    startedAt: null,
    source,
    observedAt: now,
});

/** Parse a platform timestamp to epoch ms, or `null` if it is not a usable date. */
export const parseInstant = (value: unknown): number | null => {
    if (typeof value !== "string" && typeof value !== "number") return null;
    const ms = typeof value === "number" ? value : Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
};
