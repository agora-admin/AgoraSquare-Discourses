/**
 * `useVenuePresence` — the React binding for `/api/venue-presence`.
 *
 * Deliberately thin and deliberately not clever. It owns three things and nothing else: when to
 * ask, how to abandon a request that is no longer wanted, and how to expose the answer. All
 * platform knowledge lives behind the API route, so this hook would not change if a third platform
 * were added.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { VenuePresence } from "../lib/venues/types";

/**
 * Presence moves on the order of minutes — a stream starting or ending — so a slow poll is enough
 * and the route caches underneath it. Polling faster would only spend rate limit.
 */
const POLL_MS = 60_000;

export interface VenuePresenceState {
    readonly presence: VenuePresence | null;
    readonly isLoading: boolean;
    /** The transport failed. Distinct from `presence.state === "unknown"`, which is an answer. */
    readonly isError: boolean;
    readonly refetch: () => void;
}

/**
 * @param venueKind the `VENUE_*` kind
 * @param venueRef  the off-chain channel handle, or `null` when none is recorded
 * @param enabled   false disables the request entirely — pass the same condition the frame uses so
 *                  a venue that cannot be observed does not produce traffic
 */
export const useVenuePresence = (
    venueKind: number | null | undefined,
    venueRef: string | null | undefined,
    enabled = true
): VenuePresenceState => {
    const [presence, setPresence] = useState<VenuePresence | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [nonce, setNonce] = useState(0);

    // Guards a late response from an abandoned request overwriting a newer answer.
    const requestId = useRef(0);

    const active = enabled && venueKind !== null && venueKind !== undefined;

    useEffect(() => {
        if (!active) {
            setPresence(null);
            setIsError(false);
            setIsLoading(false);
            return;
        }

        const id = ++requestId.current;
        const controller = new AbortController();

        const url =
            `/api/venue-presence?venueKind=${encodeURIComponent(String(venueKind))}` +
            (venueRef ? `&venueRef=${encodeURIComponent(venueRef)}` : "");

        const load = async (showLoading: boolean) => {
            if (showLoading) setIsLoading(true);
            try {
                const response = await fetch(url, { signal: controller.signal });
                if (id !== requestId.current) return;
                if (!response.ok) {
                    setIsError(true);
                    return;
                }
                setPresence((await response.json()) as VenuePresence);
                setIsError(false);
            } catch (error) {
                if (controller.signal.aborted || id !== requestId.current) return;
                setIsError(true);
            } finally {
                if (id === requestId.current) setIsLoading(false);
            }
        };

        void load(true);

        const timer = setInterval(() => {
            // A background tab has nobody watching the badge, so it stops asking.
            if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
            void load(false);
        }, POLL_MS);

        return () => {
            clearInterval(timer);
            controller.abort();
        };
    }, [active, venueKind, venueRef, nonce]);

    const refetch = useCallback(() => setNonce((n) => n + 1), []);

    return { presence, isLoading, isError, refetch };
};
