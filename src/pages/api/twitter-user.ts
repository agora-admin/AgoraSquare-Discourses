import { Client, auth } from 'twitter-api-sdk';

const fetchUser = async (req: any, res: any) => {
    const twitterClient = new Client(process.env.BEARER_TOKEN || "AAAAAAAAAAAAAAAAAAAAAEIcbwEAAAAAolMAUBkeCXxp4Go5tNDOnhJZAtU%3D5GtJAg1sG7VnPB5BsveIPIlCf41b5NaHZYDnCh8VxnntuySs2R");
    const twitterHandle = req.body.twitterHandle

    try {
        const usernameLookup = await twitterClient.users.findUserByUsername(
            twitterHandle,
            {
                "user.fields": ["profile_image_url"],
            }
        );

        res.status(200).send(usernameLookup)
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong.')
    }
};

export default fetchUser;