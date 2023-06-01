export const fetchImage = async (twitterHandle: string) => {
    const r =  await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}/api/twitter-user`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_ADMIN_SERVER_TOKEN,
        },
        cache: 'force-cache',
        body: JSON.stringify({
            twitterHandle: twitterHandle
        })
    }).then(res => res.json());

    return r;
}