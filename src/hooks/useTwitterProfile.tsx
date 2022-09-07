import { useState, useMemo, useEffect } from "react";
import { fetchImage } from "../helper/ProfileImageHelper";

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

    useEffect(() => {
        if(twitterHandle && twitterHandle.length >= 4 && profile.screen_name !== twitterHandle) {
            setLoading(true);
            fetchImage(twitterHandle).then(data => {
                if(data.message) {
                    setProfile({
                        screen_name: twitterHandle,
                        name: twitterHandle,
                        profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
                    });
                } else {
                    setProfile({
                        screen_name: data.screen_name!,
                        name: data.name!,
                        profile_image_url: data.profile_image_url!
                    });
                }
                setLoading(false);
            }).catch(err => {
                setLoading(false);
                setProfile({
                    screen_name: twitterHandle,
                    name: twitterHandle,
                    profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
                })
            })
        }

        if (twitterHandle && twitterHandle.length < 4) {
            setProfile({
                screen_name: twitterHandle,
                name: twitterHandle,
                profile_image_url: `https://avatar.tobi.sh/${twitterHandle}`
            })
        }
    }, [twitterHandle]);

    return { profile, loading };
}

export default useTwitterProfile;