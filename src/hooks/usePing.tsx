import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { PING } from "../lib/queries";

const usePing = () => {
    const [ping, setPing] = useState({});

    const { data, loading, error } = useQuery(PING, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setPing(data);
        }
    });

    useEffect(() => {
        if (data) {
            setPing(data);
        }
    },[data])

    return [ping, loading, error];
}

export default usePing;