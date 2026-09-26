import { useMemo } from "react";
import { useRouter } from "next/router";

import { DEMO_MODE, parseDemoVenuePoint } from "../lib/demoMode";

/**
 * The venue point a demo link asked for, or `null` when it asked for nothing.
 *
 * `DEMO_MODE` is inlined at build time and is off in any build without `NEXT_PUBLIC_DEMO`, so the
 * production path never reads the URL for this and never sees an override. The parse itself lives
 * in `parseDemoVenuePoint` so it stays pure and testable away from the router.
 */
export const useDemoVenuePoint = () => {
    const { query, isReady } = useRouter();

    return useMemo(
        () => (DEMO_MODE && isReady ? parseDemoVenuePoint(query) : null),
        [query, isReady]
    );
};
