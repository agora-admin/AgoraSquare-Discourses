import Twitter from "twitter-lite";

const fetchUser = async (screen_name: string) => {
    const client = new Twitter({
        version: '1.1',
        bearer_token: process.env.BEARER_TOKEN!,
        consumer_key: process.env.CONSUMER_KEY!,
        consumer_secret: process.env.CONSUMER_SECRET!,
    });

    return client.get('users/show', { screen_name });
}

const isValid = (data: any) => {
    if (!data?.twitterHandle) {
        return false
    }

    return true
}

const def =  async (req:any, res:any) => {
    if (req.method !== "POST") {
        res.status(405).json({ "error": "Method Not Allowed" })
    } else {
        let data = req.body;

        if (!data) {
            res.status(400).json({ "message": "invalid request body" })
        }

        if (!isValid(data)) {
            res.status(400).json({ "message": "twitterHandle field is required" })
        } else {
            let twitterHandle = data.twitterHandle

            const userResponse = await fetchUser(twitterHandle)
            let twitterInfo = {
                'screen_name': userResponse.screen_name,
                'name': userResponse.name,
                'profile_image_url': userResponse.profile_image_url_https
            }

            res.status(200).json(twitterInfo)
        }
    }
}

export default def;