import axios from "axios";
import { useState } from "react";

const useLensSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(undefined);
    const [data, setData] = useState<any>(undefined);

    const getProfiles = async (query: string) => {
        setLoading(true);
        setError(undefined);
        setData(undefined);
        try {
            axios.post('https://api.lens.dev', {
                query: `query Profiles($request: ProfileQueryRequest!) {
                    profiles(request: $request) {
                        items {
                            bio
                            id
                            handle
                            name
                        }
                    }
                }`,
                variables: { "request": { "handles": [query], "limit": 1 } }
            }).then((data) => {
                console.log('data', data);
                setData(data);
                setError(undefined);
                setLoading(false);
            }).catch((err) => {
                console.log('err',err);
                setLoading(false);
                setData(undefined);
                setError(err);
            })
        } catch (err) {
            setError(err);
            setData(undefined);
            setLoading(false);
        }
    }

    return { loading, error, data, getProfiles };
}

export default useLensSearch;