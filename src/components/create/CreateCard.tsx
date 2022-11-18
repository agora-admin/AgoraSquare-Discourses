import { FC, useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import { fetchImage } from "../../helper/ProfileImageHelper";
import useTwitterProfile from "../../hooks/useTwitterProfile";
import { Speaker } from "../../lib/Types";
import ChainTag, { ChainIcon } from "../utils/ChainTag";

interface Props {
    speakers: Speaker[];
    title: string;
}

const demoSpeaker: Speaker = {
    screen_name: "speaker",
    name: "Speaker Name",
    profile_image_url: `https://avatar.tobi.sh/speaker`
}


const CreateCard: FC<Props> = ({ speakers, title }) => {

    const speaker1 = speakers?.length >= 1 ? speakers[0] : demoSpeaker;
    const speaker2 = speakers?.length >= 2 ? speakers[1] : demoSpeaker;

    const { activeChain } = useNetwork();

    return (
        <div className='relative sm:max-w-[350px] bg-[#0A0A0A] rounded-xl p-5 flex flex-col gap-4 justify-center'>
            {/* Top Section */}
            <div className="flex items-center gap-8">
                <div className="bg-[#141414] rounded-2xl flex items-center p-3">
                    <div className="relative flex items-center">
                        <img className="scale-105 w-10 h-10 object-cover rounded-xl object-center" src={speaker1?.profile_image_url} alt="user profile image" />
                        <img className="relative top-0 right-3 scale-105 w-10 h-10 object-cover rounded-xl object-center" src={speaker2?.profile_image_url} alt="user profile image" />
                    </div>

                    <div className="flex flex-col justify-center max-w-[20ch]">
                        <small className="font-Lexend text-xs text-[#E5F7FF] font-medium max-w-[20ch] line-clamp-1">{speaker1.name}</small>
                        <small className="font-Lexend text-xs text-[#E5F7FF] font-medium max-w-[20ch] line-clamp-1">{speaker2.name}</small>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ChainIcon chainId={activeChain?.id as number} size={24} />
                </div>
            </div>

            {/* Body Section */}
            <div className="pl-2 text-white font-Lexend font-medium text-sm">{title || "This is a demo title"}</div>
        </div>
    );
}

export default CreateCard;