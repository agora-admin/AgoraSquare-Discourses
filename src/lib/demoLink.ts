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
import type { Operation } from "@apollo/client";
import {
    DEMO_DISCOURSE,
    DEMO_DISCOURSES,
    DEMO_PROP_ID,
    DEMO_SESSIONS,
} from "./demoMode";

/**
 * What the demo answers, matched on the **root fields the query selects** rather than on the
 * operation name.
 *
 * Matching by name was the first attempt and it silently never fired, which left the page on its
 * loading spinner: an operation whose `operationName` is absent or reshaped matches nothing, the
 * link forwards to an endpoint that does not resolve, and the query stays pending forever. The
 * selected fields are what the response actually has to satisfy, so they are the honest key.
 */
const FIXTURES = {
    getDiscourses: DEMO_DISCOURSES,
    getDiscoursesByChainID: DEMO_DISCOURSES,
    getDiscourseById: DEMO_DISCOURSE,
    getDiscourseByProp: DEMO_DISCOURSE,
    getSlotById: null,
    getSessions: DEMO_SESSIONS,
    getEvent: null,
    ping: "demo",
} as const;

const selectedRootFields = (operation: Operation): string[] =>
    operation.query.definitions.flatMap((definition) => {
        if (definition.kind !== "OperationDefinition") return [];
        return definition.selectionSet.selections.flatMap((selection) =>
            selection.kind === "Field" ? [selection.name.value] : []
        );
    });

const resolveFor = (operation: Operation): Record<string, unknown> | undefined => {
    const fields = selectedRootFields(operation);
    const payload: Record<string, unknown> = {};
    let matched = 0;
    for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(FIXTURES, field)) {
            payload[field] = (FIXTURES as Record<string, unknown>)[field];
            matched += 1;
        }
    }
    return matched > 0 ? payload : undefined;
};

export const demoLink = new ApolloLink((operation, forward) => {
    const payload = resolveFor(operation);
    if (payload === undefined) {
        return forward(operation);
    }

    return new Observable((observer) => {
        // One tick, so the components exercise their real loading path before resolving. A fixture
        // that resolves synchronously would hide the loading states the design specifies.
        const timer = setTimeout(() => {
            observer.next({ data: payload });
            observer.complete();
        }, 60);
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
