/**
 * The venue → playback table — a pure module, one row per venue
 * (`docs/ux/04-live-shell.md` §1.3, restating `docs/media/03` §7.2).
 *
 * This is the **only** thing the shell reads to decide what the frame contains. There is no
 * per-venue branch anywhere else, so a venue whose embed policy changes flips one row here and
 * no component changes (`docs/ux/04` §11.3).
 *
 * The verified facts this table is built on, none of which is re-derived at build time:
 *   - Twitch `https://player.twitch.tv/?channel=<name>&parent=<domain>`: `parent` is REQUIRED and
 *     must list every embedding domain; a missing or wrong `parent` yields a blank frame with no
 *     error, so an unset `NEXT_PUBLIC_EMBED_PARENT` refuses to mount the iframe at all (D9).
 *     Documented minimum 400×300.
 *   - Kick `https://player.kick.com/<channel>`: 200 with `access-control-allow-origin: *`, no
 *     frame-blocking headers observed, undocumented by Kick and unverified on mobile.
 *   - YouTube Live `https://www.youtube.com/embed/<videoId>`: minimum 200×200, mobile-web
 *     playback documented, some videos refuse embedding.
 *   - X Spaces has NO embeddable player. Verified three ways (`docs/media/03` §2.1). Nothing here
 *     ever builds one.
 *   - In person has nothing to play, and no clock to anchor a reaction to.
 *   - The Agora room is ours: no iframe, no minimum, `exact` clock.
 *
 * THE CHANNEL SLUG, and the trap (`docs/ux/04` §1.3). The chain stores
 * `keccak256(normaliseVenueRef(ref))`, so the slug a player URL uses must be a deterministic
 * function of the SAME normalised string the hash was taken from — never a second parse of a raw
 * paste. Every branch below normalises first, then takes the segment after the known host, so a
 * stray capital letter or a trailing slash cannot make the URL and the ledger disagree.
 */

import {
    VENUE_AGORA_ROOM,
    VENUE_IRL,
    VENUE_KICK,
    VENUE_TWITCH,
    VENUE_X_SPACES,
    VENUE_YOUTUBE_LIVE,
    getVenueSpec,
    normaliseVenueRef,
} from "../../helper/AgoraHelper";
import type { AnchorSync } from "../../lib/reactions";

export type VenueFrameMode = "iframe" | "native" | "strip";

export interface VenuePlaybackSpec {
    kind: number;
    /** the venue's name in words — always rendered next to the frame, never a mark alone */
    venueLabel: string;
    mode: VenueFrameMode;
    /** the frame's source, present only when `mode === "iframe"` */
    url?: string;
    /** why there is no frame, present only when `mode === "strip"` */
    reason?: string;
    /** the venue's own page, for the link out. `null` when the reference is unreadable */
    liveUrl: string | null;
    /** the clock every reaction from this venue is measured against */
    clock: AnchorSync | "none";
    /** the venue's own half-width in ms; 0 only where the clock is ours */
    uncertaintyMs: number;
    /** whether a third-party frame is ever mounted for this venue */
    embeddable: boolean;
    /**
     * Whether a viewer-visible reference exists in principle. It decides whether an unreadable
     * reference is stated as a missing link — an in-person session has no link to be missing, and
     * saying one "has not been published" would invent an obligation nobody has.
     */
    linkExpected: boolean;
    /** the minimum width the platform documents, in px (0 = we set no floor) */
    minWidth: number;
}

/** `docs/ux/06` §6.1 — the venue's own half-width, so no copy hard-codes a ± figure. */
const UNCERTAINTY_MS = {
    exact: 0,
    measured: 2000,
    kick: 8000,
    spaces: 10000,
};

/** Twitch's documented floor. Below this the embed must not be mounted at all (§6.5). */
export const TWITCH_MIN_WIDTH = 400;
/** YouTube's documented floor, and the one venue the compact shell still mounts (§6.2). */
export const YOUTUBE_MIN_WIDTH = 200;
/**
 * The width below which the shell is "compact" — a copy and layout decision, not a mount gate.
 *
 * It selects the strip's wording (and the shell's stacked layout), and it is deliberately **not**
 * consulted by `frameWidthAllows`: that decides on the frame's measured width alone, because the
 * measurement already answers the only question that matters — whether the platform's documented
 * minimum is met.
 */
export const COMPACT_MAX_WIDTH = 639;

const HOST_SEPARATOR = /[/?#]/;

/**
 * Path segments that are never a channel name. A Twitch VOD URL (`twitch.tv/videos/123`) or a Kick
 * browse URL would otherwise yield the channel `videos`, and framing a nonsense channel is a
 * broken frame with extra steps — so a reference that resolves to one is treated as unusable.
 */
const RESERVED_SEGMENTS: Record<string, string[]> = {
    twitch: ["videos", "directory", "p", "downloads", "settings", "subscriptions", "wallet", "drops", "turbo", "search", "jobs"],
    kick: ["video", "videos", "categories", "browse", "following", "search"],
};

/**
 * The reference segment that follows a known host, or the bare reference when no host is present.
 * Always taken from `normaliseVenueRef`'s output, never from the raw paste.
 */
const refSegment = (raw: string, hosts: string[], reserved: string[] = []): string | null => {
    const normalised = normaliseVenueRef(raw);
    if (!normalised) {
        return null;
    }
    const host = hosts.find((candidate) => normalised.startsWith(`${candidate}/`));
    const withoutHost = host ? normalised.slice(host.length + 1) : normalised;
    const segment = withoutHost.split(HOST_SEPARATOR)[0];
    if (segment.length === 0 || reserved.includes(segment)) {
        return null;
    }
    return segment;
};

/**
 * The Space id from any of the shapes the create flow stores: `x.com/i/spaces/<id>`,
 * `twitter.com/i/spaces/<id>`, or the bare id. Note the two-segment path — taking the first
 * segment here yields the literal string `i`, which is why Spaces does not use `refSegment`.
 */
const spaceIdFromRef = (raw: string): string | null => {
    const normalised = normaliseVenueRef(raw);
    if (!normalised) {
        return null;
    }
    const match = normalised.match(/(?:^|\/)(?:i\/)?spaces\/([a-z0-9]+)$/);
    if (match?.[1]) {
        return match[1];
    }
    const last = normalised.split(HOST_SEPARATOR).filter(Boolean).pop();
    if (!last || last === "x.com" || last === "twitter.com" || last === "i" || last === "spaces") {
        return null;
    }
    return last;
};

/**
 * A YouTube video id from any of the shapes a host may paste: a watch URL, a short link, a
 * `/live/` URL, an embed URL, or the bare id.
 */
const youtubeVideoId = (raw: string): string | null => {
    const normalised = normaliseVenueRef(raw);
    if (!normalised) {
        return null;
    }
    const query = normalised.match(/[?&]v=([a-z0-9_-]+)/);
    if (query?.[1]) {
        return query[1];
    }
    for (const host of ["youtube.com", "youtu.be", "m.youtube.com"]) {
        if (!normalised.startsWith(`${host}/`)) {
            continue;
        }
        const rest = normalised.slice(host.length + 1);
        const parts = rest.split(HOST_SEPARATOR).filter(Boolean);
        if (host === "youtu.be") {
            return parts[0] ?? null;
        }
        if (parts[0] === "live" || parts[0] === "embed" || parts[0] === "shorts") {
            return parts[1] ?? null;
        }
        return parts[0] ?? null;
    }
    // A bare id, which is what the create flow stores when the broadcast did not exist yet.
    return /^[a-z0-9_-]{6,}$/.test(normalised) ? normalised : null;
};

/**
 * Twitch's `parent` list. It is configuration, never a constant, and never a
 * `window.location.hostname` fallback: a fallback that is right in preview and wrong in
 * production is worse than an obvious absence (`docs/ux/04` §6.3).
 */
export const embedParents = (): string[] => {
    const raw = process.env.NEXT_PUBLIC_EMBED_PARENT;
    if (typeof raw !== "string") {
        return [];
    }
    const seen = new Set<string>();
    raw
        .split(",")
        .map((domain) => domain.trim().toLowerCase())
        .filter((domain) => domain.length > 0)
        .forEach((domain) => seen.add(domain));
    return Array.from(seen);
};

const twitchParentQuery = (parents: string[]): string =>
    parents.map((domain) => `parent=${encodeURIComponent(domain)}`).join("&");

/**
 * The frame's reason strings are the copy deck's, verbatim (`docs/ux/04` §9.5). A reason is what
 * a viewer reads instead of a blank frame, so it is never a configuration value and never blames
 * the viewer.
 */
export const STRIP_REASON = {
    spaces: "This session is running in an X Space. Agora cannot play a Space.",
    spacesScheduled: "This session will run in an X Space. It cannot be played on this page.",
    spacesEnded:
        "This discussion took place in an X Space. Agora does not hold a copy. A Space cannot be recorded by Agora, and it disappears from the X API when it ends.",
    irl: "This session is in person. There is nothing to play here.",
    irlEnded: "It happened in person, and no recording was supplied.",
    noParent: "The player is not available here.",
    noReference: "The venue link has not been published for this session.",
    narrowTwitch: "Streaming from Twitch. This player cannot be shown on a screen this narrow.",
    narrowKick: "Streaming from Kick. This player cannot be shown on a screen this narrow.",
    scheduled: "The player opens here when the session starts.",
    /** A live-channel embed cannot play a past session, so an ended Twitch/Kick session is a strip. */
    noPlatformCopy: "The platform keeps a copy for a while, and it is not the record.",
    endedNoCopy: "Agora does not hold a copy of this discussion.",
    roomProcessing: "The recording is still being processed.",
    offline: "You are offline. The stream cannot be shown here.",
} as const;

/**
 * The video id or channel a frame needs, for the venues that have one. Exported because the
 * shell's `title` and link-out also want it, and neither may re-parse the reference.
 */
export const venuePlaybackSpec = (kind: number, venueRef: string | null): VenuePlaybackSpec => {
    const label = getVenueSpec(kind)?.label ?? "External venue";
    const ref = venueRef && venueRef.trim().length > 0 ? venueRef : null;
    const base = {
        kind,
        venueLabel: label,
        liveUrl: null as string | null,
        embeddable: false,
        linkExpected: false,
        minWidth: 0,
    };

    switch (kind) {
        case VENUE_TWITCH: {
            const channel = ref ? refSegment(ref, ["twitch.tv", "m.twitch.tv", "go.twitch.tv"], RESERVED_SEGMENTS.twitch) : null;
            const parents = embedParents();
            if (!channel) {
                return {
                    ...base,
                    mode: "strip",
                    reason: STRIP_REASON.noReference,
                    clock: "estimated",
                    uncertaintyMs: UNCERTAINTY_MS.kick,
                    liveUrl: null,
                    linkExpected: true,
                };
            }
            if (parents.length === 0) {
                return {
                    ...base,
                    mode: "strip",
                    reason: STRIP_REASON.noParent,
                    clock: "measured",
                    uncertaintyMs: UNCERTAINTY_MS.measured,
                    liveUrl: `https://www.twitch.tv/${channel}`,
                    linkExpected: true,
                };
            }
            return {
                ...base,
                mode: "iframe",
                url: `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${twitchParentQuery(parents)}&muted=true`,
                clock: "measured",
                uncertaintyMs: UNCERTAINTY_MS.measured,
                embeddable: true,
                minWidth: TWITCH_MIN_WIDTH,
                liveUrl: `https://www.twitch.tv/${channel}`,
                linkExpected: true,
            };
        }

        case VENUE_KICK: {
            const channel = ref ? refSegment(ref, ["kick.com", "www.kick.com"], RESERVED_SEGMENTS.kick) : null;
            if (!channel) {
                return {
                    ...base,
                    mode: "strip",
                    reason: STRIP_REASON.noReference,
                    clock: "estimated",
                    uncertaintyMs: UNCERTAINTY_MS.kick,
                    linkExpected: true,
                };
            }
            return {
                ...base,
                mode: "iframe",
                // Kick takes no `parent`: nothing to configure, and nothing to refuse to mount.
                url: `https://player.kick.com/${encodeURIComponent(channel)}`,
                clock: "estimated",
                uncertaintyMs: UNCERTAINTY_MS.kick,
                embeddable: true,
                minWidth: TWITCH_MIN_WIDTH,
                liveUrl: `https://kick.com/${channel}`,
                linkExpected: true,
            };
        }

        case VENUE_YOUTUBE_LIVE: {
            const videoId = ref ? youtubeVideoId(ref) : null;
            if (!videoId) {
                return {
                    ...base,
                    mode: "strip",
                    reason: STRIP_REASON.noReference,
                    clock: "estimated",
                    uncertaintyMs: UNCERTAINTY_MS.kick,
                    linkExpected: true,
                };
            }
            return {
                ...base,
                mode: "iframe",
                url: `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`,
                clock: "measured",
                uncertaintyMs: UNCERTAINTY_MS.measured,
                embeddable: true,
                minWidth: YOUTUBE_MIN_WIDTH,
                liveUrl: `https://www.youtube.com/watch?v=${videoId}`,
                linkExpected: true,
            };
        }

        case VENUE_X_SPACES: {
            const spaceId = ref ? spaceIdFromRef(ref) : null;
            return {
                ...base,
                mode: "strip",
                // There is no embeddable Spaces player. Verified three ways, never designed for.
                reason: STRIP_REASON.spaces,
                clock: "estimated",
                uncertaintyMs: UNCERTAINTY_MS.spaces,
                liveUrl: spaceId ? `https://x.com/i/spaces/${spaceId}` : null,
                linkExpected: true,
            };
        }

        case VENUE_IRL:
            return {
                ...base,
                mode: "strip",
                reason: STRIP_REASON.irl,
                // No player means no clock: a reaction with no moment is refused (`docs/ux/06` §4.5).
                clock: "none",
                uncertaintyMs: 0,
            };

        case VENUE_AGORA_ROOM:
            return {
                ...base,
                mode: "native",
                clock: "exact",
                uncertaintyMs: UNCERTAINTY_MS.exact,
                embeddable: true,
                liveUrl: null,
            };

        default:
            // An unknown kind is never guessed at (`docs/ux/04` §3.12).
            return {
                ...base,
                mode: "strip",
                reason: STRIP_REASON.noReference,
                clock: "none",
                uncertaintyMs: 0,
            };
    }
};

/**
 * The mount rule (§6.2, D4). A third-party frame is mounted only where the platform documents a
 * minimum we can meet.
 *
 * **The measurement is the whole rule.** An earlier version also short-circuited on
 * `COMPACT_MAX_WIDTH`: below that it allowed only YouTube, whatever the frame had actually
 * measured. But `width` here is the frame column's real width, and a 400 px column satisfies
 * Twitch's documented 400×300 minimum exactly. So the extra branch refused Twitch between 400 and
 * 639 px — a laptop window, not a phone — and the reader got "this player cannot be shown on a
 * screen this narrow" while holding a screen wide enough to show it. Phones are still refused,
 * because at a 393 px viewport the column measures ~290 px, which genuinely is under 400.
 */
export const frameWidthAllows = (spec: VenuePlaybackSpec, width: number): boolean => {
    if (!spec.embeddable || spec.mode !== "iframe") {
        return false;
    }
    // A venue with no declared minimum takes YouTube's, which is the lowest of the three.
    const required = spec.minWidth > 0 ? spec.minWidth : YOUTUBE_MIN_WIDTH;
    return width >= Math.max(required, spec.kind === VENUE_YOUTUBE_LIVE ? YOUTUBE_MIN_WIDTH : TWITCH_MIN_WIDTH);
};

/**
 * The temporal axis applied to the venue table (`docs/ux/04` §3.1). The frame's content is a
 * product of the venue and the session's state, and this is the one place the two meet:
 *
 *  - **scheduled** and **live-unconfirmed** never mount a player. A player mounted on a guess is
 *    how an empty frame happens, and the shell never says "live" on the strength of a schedule.
 *  - **ended** with a channel reference (Twitch, Kick) is a strip, because a live-channel embed
 *    cannot play a past session — it would render the venue's own "offline" box, which is the
 *    broken frame the honesty rules forbid. YouTube is the exception: a video id addresses a
 *    finished video, so the copy can genuinely be played there, labelled as not being the record.
 */
export const playbackForTemporal = (
    spec: VenuePlaybackSpec,
    temporal: "scheduled" | "live" | "live-unconfirmed" | "ended"
): VenuePlaybackSpec => {
    if (temporal === "scheduled" || temporal === "live-unconfirmed") {
        const at = spec.liveUrl ? spec.liveUrl.replace(/^https?:\/\/(www\.)?/, "") : null;
        return {
            ...spec,
            mode: "strip",
            reason:
                temporal === "scheduled"
                    ? spec.kind === VENUE_X_SPACES
                        ? STRIP_REASON.spacesScheduled
                        : STRIP_REASON.scheduled
                    : at
                    ? `If it is running, it is at ${at}.`
                    : STRIP_REASON.scheduled,
        };
    }

    if (temporal === "ended" && spec.mode === "iframe" && spec.kind !== VENUE_YOUTUBE_LIVE) {
        return { ...spec, mode: "strip", reason: STRIP_REASON.noPlatformCopy };
    }

    if (temporal === "ended" && spec.kind === VENUE_X_SPACES) {
        return { ...spec, mode: "strip", reason: STRIP_REASON.spacesEnded };
    }

    if (temporal === "ended" && spec.kind === VENUE_IRL) {
        return { ...spec, mode: "strip", reason: STRIP_REASON.irlEnded };
    }

    return spec;
};
