/**
 * `GET /api/venue-presence?venueKind=<n>&venueRef=<channel>`
 *
 * The browser's single entry point for liveness. It exists so that:
 *   - the Twitch client secret stays on the server, where it belongs;
 *   - the browser makes one request shape regardless of platform;
 *   - both upstream APIs are called from one place that can cache and single-flight them.
 *
 * This file is a boundary, not a layer: it validates the inputs, delegates to the facade and
 * shapes the response. Any branch on platform identity here would be a leak, so there is none.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { resolvePresence, PRESENCE_TTL_MS } from "../../lib/venues/presence";
import type { VenuePresence } from "../../lib/venues/types";

interface ErrorBody {
    readonly error: string;
}

const MAX_REF_LENGTH = 128;

const readParam = (value: string | string[] | undefined): string | null => {
    if (typeof value === "string") return value;
    // A repeated query parameter is ambiguous, not a list to pick from.
    return null;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<VenuePresence | ErrorBody>
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed." });
    }

    const kindRaw = readParam(req.query.venueKind);
    const refRaw = readParam(req.query.venueRef);

    if (kindRaw === null) {
        return res.status(400).json({ error: "venueKind is required." });
    }
    const venueKind = Number(kindRaw);
    if (!Number.isInteger(venueKind) || venueKind < 0) {
        return res.status(400).json({ error: "venueKind must be a non-negative integer." });
    }
    if (refRaw !== null && refRaw.length > MAX_REF_LENGTH) {
        return res.status(400).json({ error: "venueRef is too long." });
    }

    const presence = await resolvePresence({
        venueKind,
        venueRef: refRaw === null || refRaw.length === 0 ? null : refRaw,
    });

    // Public, short-lived, and matched to the facade's own TTL so a browser refresh cannot outrun
    // the cache and multiply upstream calls.
    res.setHeader("Cache-Control", `public, max-age=${Math.floor(PRESENCE_TTL_MS / 1000)}`);
    return res.status(200).json(presence);
}
