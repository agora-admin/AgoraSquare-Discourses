/**
 * Kick presence, via the public v2 channel endpoint.
 *
 * `https://kick.com/api/v2/channels/<slug>` needs no credentials and returns the whole channel,
 * including a `livestream` object that is `null` when the channel is offline. This is Kick's public
 * web API rather than a documented partner API, so the shape is treated as untrusted here: every
 * field is read defensively and a missing one degrades to `unknown` rather than to a wrong answer.
 *
 * Server-side like its Twitch sibling, for one reason that is about consistency rather than
 * secrets: routing both platforms through the same boundary means the browser has exactly one
 * contract to know, and if Kick ever stops reflecting the origin this keeps working unchanged.
 */

import { offlinePresence, parseInstant, unknownPresence, type VenuePresence } from "./types";

const CHANNEL_URL = "https://kick.com/api/v2/channels";
const TIMEOUT_MS = 6000;

interface KickLivestream {
    readonly is_live?: boolean;
    readonly viewer_count?: number;
    readonly start_time?: string;
    readonly session_title?: string;
}

interface KickChannel {
    readonly slug?: string;
    readonly is_banned?: boolean;
    readonly livestream?: KickLivestream | null;
}

export const fetchKickPresence = async (slug: string, now: number): Promise<VenuePresence> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(`${CHANNEL_URL}/${encodeURIComponent(slug)}`, {
            // Kick serves a JSON API to its own site; this header asks for that rather than the HTML.
            headers: { accept: "application/json" },
            signal: controller.signal,
            cache: "no-store",
        });

        if (response.status === 404) {
            return unknownPresence(`Kick has no channel called ${slug}.`, now);
        }
        if (!response.ok) {
            return unknownPresence(`Kick answered ${response.status}.`, now);
        }

        const channel = (await response.json()) as KickChannel;

        if (channel.is_banned === true) {
            return unknownPresence(`${slug} is banned on Kick, so it cannot be live here.`, now);
        }

        // `null` is Kick's "offline". A missing key is not the same thing and is left unknown.
        const stream = channel.livestream;
        if (stream === null || stream === undefined) {
            return stream === null
                ? offlinePresence("kick-public", now)
                : unknownPresence("Kick's response did not say whether the channel is live.", now);
        }
        if (stream.is_live !== true) {
            return offlinePresence("kick-public", now);
        }

        return {
            state: "live",
            startedAt: parseInstant(stream.start_time),
            source: "kick-public",
            observedAt: now,
            viewerCount: typeof stream.viewer_count === "number" ? stream.viewer_count : null,
            title: typeof stream.session_title === "string" ? stream.session_title : null,
        };
    } catch (error) {
        const aborted = error instanceof Error && error.name === "AbortError";
        return unknownPresence(
            aborted ? "Kick did not answer in time." : "Kick could not be reached.",
            now
        );
    } finally {
        clearTimeout(timer);
    }
};
