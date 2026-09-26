/**
 * The presence facade: given a venue and a channel reference, ask the right platform.
 *
 * This is the only file that maps a venue kind onto a client. Adding a platform means adding a
 * client and one line here; nothing else in the app changes, and no caller ever branches on the
 * platform itself.
 *
 * Callers get a `VenuePresence` or an honest `unknown`. They never get an exception — a platform
 * being down is a fact to display, not an error to handle at every call site.
 */

import {
    VENUE_KICK,
    VENUE_TWITCH,
    VENUE_YOUTUBE_LIVE,
    VENUE_X_SPACES,
    VENUE_IRL,
    VENUE_AGORA_ROOM,
} from "../../helper/AgoraHelper";
import { createSingleFlight, createTtlCache } from "./cache";
import { fetchKickPresence } from "./kick";
import { fetchTwitchPresence } from "./twitch";
import { unknownPresence, type VenuePresence } from "./types";

/**
 * Matches the cadence the discussion page polls at. Both platforms rate-limit per client id, and a
 * live badge that is half a minute stale is not a problem worth a ban for.
 */
const TTL_MS = 30_000;

const cache = createTtlCache<VenuePresence>(TTL_MS);
const once = createSingleFlight(cache);

/** Kick and Twitch both take a bare handle: no scheme, no `www`, no trailing slash. */
export const normaliseChannelRef = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return "";

    // A bare handle is the common case and must not go through the URL parser: `new URL("xqc")` is
    // not a URL at all, and treating it as one re-reads the handle as a *hostname* and yields an
    // empty path — which silently looked like "no channel recorded".
    const looksLikeUrl = trimmed.includes("/") || /^https?:/i.test(trimmed);
    if (!looksLikeUrl) {
        return trimmed.replace(/^[@#]+/, "").toLowerCase();
    }

    // A full URL is accepted because that is what a creator pastes, and reduced to its handle.
    const asUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const url = new URL(asUrl);
        const segments = url.pathname.split("/").filter(Boolean);
        // `twitch.tv/<channel>` and `kick.com/<channel>` both put the handle first; `/videos/…`
        // and `/popout/…` put a route word there, so those degrade to unknown rather than a guess.
        const routeWords = new Set(["videos", "video", "popout", "embed", "chat", "clip", "clips"]);
        const first = segments[0] ?? "";
        if (segments.length === 1 && !routeWords.has(first)) return first.toLowerCase();
        return "";
    } catch {
        return trimmed.replace(/^[@#/]+/, "").split("/")[0].toLowerCase();
    }
};

export interface PresenceRequest {
    readonly venueKind: number;
    /** The off-chain channel reference. The chain stores only its hash. */
    readonly venueRef: string | null;
}

/**
 * Resolve presence for one venue. Never throws.
 *
 * @param now injectable so tests and the route agree on the clock
 */
export const resolvePresence = async (
    request: PresenceRequest,
    now: () => number = Date.now
): Promise<VenuePresence> => {
    const at = now();
    const channel = request.venueRef === null ? "" : normaliseChannelRef(request.venueRef);

    const key = `${request.venueKind}:${channel}`;
    return once(key, now, async () => {
        switch (request.venueKind) {
            case VENUE_TWITCH:
                if (channel.length === 0) {
                    return unknownPresence("No Twitch channel is recorded for this session.", at);
                }
                return fetchTwitchPresence(channel, at);

            case VENUE_KICK:
                if (channel.length === 0) {
                    return unknownPresence("No Kick channel is recorded for this session.", at);
                }
                return fetchKickPresence(channel, at);

            // Every other venue is deliberately `unknown` rather than offline. We cannot observe
            // them, and `docs/media/03` records why for each — Spaces has no readable state, IRL has
            // no channel, and our own room is tracked in-product, not by a third party.
            case VENUE_YOUTUBE_LIVE:
                return unknownPresence(
                    "YouTube liveness is not readable without the channel's API credentials; the player still embeds.",
                    at
                );
            case VENUE_X_SPACES:
                return unknownPresence(
                    "A Space cannot be read or embedded, so liveness cannot be observed here.",
                    at
                );
            case VENUE_IRL:
                return unknownPresence("An in-person session has no channel to observe.", at);
            case VENUE_AGORA_ROOM:
                return unknownPresence(
                    "Our own room reports liveness in-product rather than through a platform.",
                    at
                );
            default:
                return unknownPresence(`Venue kind ${request.venueKind} is not recognised.`, at);
        }
    });
};

/** Exposed for tests and for the route's own diagnostics. */
export const PRESENCE_TTL_MS = TTL_MS;
