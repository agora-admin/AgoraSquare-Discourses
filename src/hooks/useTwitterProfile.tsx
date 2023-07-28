import {useState, useEffect, useCallback} from "react";
import { fetchImage } from "../helper/ProfileImageHelper";
import axios from "axios";

interface TwitterProfile {
    screen_name: string;
    name: string;
    profile_image_url: string;
}

const useTwitterProfile = (twitterHandle: string) => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<TwitterProfile>({
        screen_name: twitterHandle,
        name: twitterHandle,
        profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
    });

    const getUserData = useCallback(async (username) => {
        let user = await axios.post('http://localhost:3000/api/twitter-user', {twitterHandle: username})
        return user
    }, [twitterHandle])

    useEffect(() => {
        if(twitterHandle && twitterHandle.length >= 4 && profile.screen_name !== twitterHandle) {
            setLoading(true);
            getUserData(twitterHandle).then((data) => {
                console.log(data)

                setProfile({
                    screen_name: twitterHandle,
                    name: data.data.data.name,
                    profile_image_url: data.data.data.profile_image_url
                });
                setLoading(false);
            }).catch((err) => {
                console.log(err)
                setLoading(false);
                setProfile({
                    screen_name: twitterHandle,
                    name: twitterHandle,
                    profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
                })
            })
            // fetchImage(twitterHandle).then(data => {
            //     if(data.message) {
            //         setProfile({
            //             screen_name: twitterHandle,
            //             name: twitterHandle,
            //             profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
            //         });
            //     } else {
            //         setProfile({
            //             screen_name: data.screen_name!,
            //             name: data.name!,
            //             profile_image_url: data.profile_image_url!
            //         });
            //     }
            //     setLoading(false);
            // }).catch(err => {
            //     setLoading(false);
            //     setProfile({
            //         screen_name: twitterHandle,
            //         name: twitterHandle,
            //         profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
            //     })
            // })
        }

        if (twitterHandle && twitterHandle.length < 4) {
            setProfile({
                screen_name: twitterHandle,
                name: twitterHandle,
                profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
            })
        }
    }, [profile.screen_name, twitterHandle]);

    return { profile, loading };
}

export default useTwitterProfile;