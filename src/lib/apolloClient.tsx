import { ApolloClient, from, HttpLink, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import Cookies from "js-cookie";
import { setContext } from "@apollo/client/link/context";

export default function createApolloClient() {
    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_SERVER_URL,
        // uri: "http://localhost/",
        credentials: 'include',
        // headers: {
        //     'Content-Type': 'application/json',
        //     'Access-Control-Allow-Credentials': 'true',
        //     'Authorization': 'Bearer ' + Cookies.get('jwt')
        // }
    });

    const authLink = setContext((_, { headers }) => {
        const token = Cookies.get('jwt');
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : null
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

    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: from([errorLink, authLink.concat(httpLink)]),
        cache: new InMemoryCache()
    })
}