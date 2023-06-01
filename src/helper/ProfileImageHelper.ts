export const fetchImage = async (twitterHandle: string) => {
    const r =  await fetch(`/api/twitter-user`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'force-cache',
        body: JSON.stringify({
            twitterHandle: twitterHandle
        })
    }).then(res => res.json());

    return r;
}