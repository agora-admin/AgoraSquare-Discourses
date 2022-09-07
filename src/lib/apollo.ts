import { ApolloClient } from "@apollo/client";
import { useMemo } from "react";
import createApolloClient from "./apolloClient";

let apolloClient : ApolloClient<any>;

export function initializeApollo(initialState: any = null) {
    const _apolloClient = apolloClient ?? createApolloClient();

    if (initialState) {
        const existingCache = _apolloClient.extract();

        _apolloClient.cache.restore({ ...existingCache, ...initialState });
    }

    if (typeof window === "undefined") return _apolloClient;

    if (!apolloClient) apolloClient = _apolloClient;

    return _apolloClient;
}

export function useApollo(initialState : any) {
    const store = useMemo(() => initializeApollo(initialState), [initialState]);
    return store;
}