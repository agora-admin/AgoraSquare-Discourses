/**
 * Twitch presence, via the Helix API.
 *
 * **Server-only.** Helix needs a Client ID *and* a Client Secret, and the secret must never reach a
 * browser. Nothing in this file is imported by a component; `src/pages/api/venue-presence.ts` is
 * the only caller, and Next only ever bundles that route for the server.
 *
 * Two requests, one cached token:
 *   POST /oauth2/token          client_credentials -> an app access token, valid ~60 days
 *   GET  /helix/streams         user_login=<channel> -> one entry when live, none when not
 *
 * The token is cached in module scope until shortly before it expires. It is a machine credential
 * for public data, not a user session, so there is nothing per-reader to isolate.
 */

import { offlinePresence, parseInstant, unknownPresence, type VenuePresence } from "./types";

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const STREAMS_URL = "https://api.twitch.tv/helix/streams";
const TIMEOUT_MS = 6000;
/** Refresh a little early so a token cannot expire mid-flight. */
const TOKEN_SAFETY_MS = 60_000;

interface CachedToken {
    readonly value: string;
    readonly expiresAt: number;
}

let cachedToken: CachedToken | null = null;

/** Read at call time, not import time, so a test or a redeploy can change them without a restart. */
const credentials = () => ({
    clientId: process.env.TWITCH_CLIENT_ID ?? "",
    clientSecret: process.env.TWITCH_CLIENT_SECRET ?? "",
});

export const isTwitchConfigured = (): boolean => {
    const { clientId, clientSecret } = credentials();
    return clientId.length > 0 && clientSecret.length > 0;
};

const withTimeout = async (url: string, init: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
};

const getAppToken = async (now: number): Promise<string | null> => {
    if (cachedToken && cachedToken.expiresAt > now) return cachedToken.value;

    const { clientId, clientSecret } = credentials();
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
    });

    const response = await withTimeout(TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as { access_token?: string; expires_in?: number };
    if (typeof payload.access_token !== "string" || payload.access_token.length === 0) return null;

    const ttlMs = (payload.expires_in ?? 3600) * 1000;
    cachedToken = { value: payload.access_token, expiresAt: now + ttlMs - TOKEN_SAFETY_MS };
    return cachedToken.value;
};

/**
 * @param login the channel's login name — the lowercase handle in `twitch.tv/<login>`. A display
 *              name is not the same thing, so callers pass what the URL carries.
 */
export const fetchTwitchPresence = async (login: string, now: number): Promise<VenuePresence> => {
    if (!isTwitchConfigured()) {
        return unknownPresence(
            "Twitch liveness needs TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET on the server. The player still embeds without them; only the live badge is unavailable.",
            now
        );
    }

    try {
        const token = await getAppToken(now);
        if (token === null) {
            return unknownPresence("Twitch refused an app token; check the client credentials.", now);
        }

        const { clientId } = credentials();
        const url = `${STREAMS_URL}?user_login=${encodeURIComponent(login)}`;
        const response = await withTimeout(url, {
            headers: { "client-id": clientId, authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (response.status === 401) {
            // The token was rejected despite the cache — drop it so the next call re-mints.
            cachedToken = null;
            return unknownPresence("Twitch rejected the app token.", now);
        }
        if (!response.ok) {
            return unknownPresence(`Twitch answered ${response.status}.`, now);
        }

        const payload = (await response.json()) as {
            data?: Array<{ started_at?: string; viewer_count?: number; title?: string }>;
        };
        const stream = payload.data?.[0];
        if (stream === undefined) {
            return offlinePresence("twitch-helix", now);
        }

        return {
            state: "live",
            // `started_at` is when the *stream* began, which is the closest thing to a session t=0
            // the platform exposes. It is not our clock, so the caller records it as reported.
            startedAt: parseInstant(stream.started_at),
            source: "twitch-helix",
            observedAt: now,
            viewerCount: typeof stream.viewer_count === "number" ? stream.viewer_count : null,
            title: typeof stream.title === "string" ? stream.title : null,
        };
    } catch (error) {
        const aborted = error instanceof Error && error.name === "AbortError";
        return unknownPresence(
            aborted ? "Twitch did not answer in time." : "Twitch could not be reached.",
            now
        );
    }
};

/** For tests. */
export const resetTwitchToken = (): void => {
    cachedToken = null;
};
