/**
 * The demo transport for GraphQL.
 *
 * `apolloClient` points at `https://api.agorasquare.io`, which does not resolve without the
 * indexer, so every list and detail query fails and the pages render their error or 404 state.
 * In demo mode this link answers the handful of operations the campaign journey needs from
 * `demoMode.ts` and forwards everything else untouched.
 *
 * It sits *in front of* the HTTP link rather than replacing it, so any query the fixtures do not
 * cover still behaves exactly as it does in production — including the error behaviour, which the
 * product deliberately surfaces rather than hides.
 */

import { ApolloLink, Observable } from "@apollo/client";
import {
    DEMO_DISCOURSE,
    DEMO_DISCOURSES,
    DEMO_PROP_ID,
    DEMO_SESSIONS,
} from "./demoMode";

const resolveFor = (operationName: string, variables: Record<string, unknown>): unknown | undefined => {
    switch (operationName) {
        case "GetDiscourses":
        case "GetDiscoursesByChainID":
            return { getDiscourses: DEMO_DISCOURSES, getDiscoursesByChainID: DEMO_DISCOURSES };
        case "GetDiscourseById":
            // The `GET_DISCOURSE_BY_ID` document selects two root fields in one operation, so this
            // response must carry both. Omitting `getSlotById` leaves Apollo waiting on a field that
            // never arrives and the page stays on its loading screen.
            return { getDiscourseById: DEMO_DISCOURSE, getSlotById: null };
        case "GetDiscourseByProp":
            return { getDiscourseByProp: DEMO_DISCOURSE };
        case "GetSessions":
            return { getSessions: DEMO_SESSIONS };
        case "GetEvent":
            // The scheduling query. Returning an empty event lets the page fall through to the
            // shell rather than blocking on a request that will never answer.
            return { getEvent: null };
        case "Ping":
            return { ping: "demo" };
        default:
            void variables;
            return undefined;
    }
};

export const demoLink = new ApolloLink((operation, forward) => {
    const payload = resolveFor(operation.operationName, operation.variables ?? {});
    if (payload === undefined) {
        return forward(operation);
    }

    operation.setContext({ demo: true });
    return new Observable((observer) => {
        // One tick, so the components exercise their real loading path before resolving. A fixture
        // that resolves synchronously would hide the loading states the design specifies.
        const timer = setTimeout(() => {
            observer.next({ data: payload });
            observer.complete();
        }, 120);
        return () => clearTimeout(timer);
    });
});

/** The operation names the demo link answers — exported so a page can tell the reader. */
export const DEMO_OPERATIONS = [
    "GetDiscourses",
    "GetDiscoursesByChainID",
    "GetDiscourseById",
    "GetDiscourseByProp",
    "GetSessions",
    "GetEvent",
    "Ping",
] as const;

/** True when the reader is looking at fixture data rather than the indexer. */
export const isDemoDiscourse = (propId: number | string | undefined): boolean =>
    Number(propId) === DEMO_PROP_ID;
