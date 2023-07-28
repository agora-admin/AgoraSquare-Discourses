import { Client, auth } from 'twitter-api-sdk';

const fetchUser = async (req: any, res: any) => {
    // const twitterClient = new Client(process.env.BEARER_TOKEN as string);
    const twitterClient = new Client("AAAAAAAAAAAAAAAAAAAAAEIcbwEAAAAAMIIFcWEamrkBoCvIs%2BcWXYvfomg%3DvqBf5JTqSf1CAW9vtdsiVoYrdRIouRP6tnZGBOdC0mnqzMNMdy");
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