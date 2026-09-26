import { ApolloClient, from, HttpLink, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { DEMO_MODE } from "./demoMode";
import { demoLink } from "./demoLink";

export default function createApolloClient() {
    const httpLink = new HttpLink({
        uri: "https://api.agorasquare.io",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',

        }
    });

    const authLink = setContext((_, { headers }) => {
        return {
            headers: {
                ...headers,
            }
        }
    })

    const errorLink = onError(({ graphQLErrors, networkError}) => {
        if (graphQLErrors)
            graphQLErrors.map(({ message, locations, path }) =>
                console.log(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                ),
            );
        if (networkError) console.log(`[Network error]: ${networkError}`);
    })

    // In demo mode the fixture link answers the campaign journey's operations before the request
    // ever leaves the browser; everything it does not cover still goes to the real endpoint, so a
    // demo build behaves identically to production for every operation the fixtures are silent on.
    // `NEXT_PUBLIC_DEMO` is inlined at build time, so a production build drops the link entirely.
    const transport = DEMO_MODE
        ? from([errorLink, authLink, demoLink, httpLink])
        : from([errorLink, authLink.concat(httpLink)]);

    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: transport,
        cache: new InMemoryCache()
    })
}