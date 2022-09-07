import { FC, useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import { fetchImage } from "../../helper/ProfileImageHelper";
import useTwitterProfile from "../../hooks/useTwitterProfile";
import { Speaker } from "../../lib/Types";
import ChainTag from "../utils/ChainTag";

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
        <div className='sm:min-w-[250px] max-w-[300px] bg-card p-4 rounded-xl flex flex-col gap-2 justify-between w-full mt-6 sm:mt-0 sm:w-max'>
            {/* left section */}

            {/* avatar */}
            <div className="flex items-center gap-2">

                <div className='flex items-center w-16 h-8 relative'>
                    <div className='flex items-center w-8 h-8 rounded-xl ring-[3px] ring-[#141515] overflow-clip'>
                        <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={speaker1?.profile_image_url!} alt="" />
                    </div>
                    <div className='flex items-center absolute left-[35%] w-8 h-8 rounded-xl ring-[3px] ring-[#141515] overflow-clip'>
                        <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={speaker2?.profile_image_url} alt="" />
                    </div>
                </div>
                <div className='flex flex-col'>
                    <h4 className='text-[#c6c6c6] text-xs tracking-wide font-medium line-clamp-1'>{speaker1?.name}</h4>
                    <h4 className='text-[#c6c6c6] text-xs tracking-wide font-medium line-clamp-1'>{speaker2?.name}</h4>
                </div>
            </div>

            {/* title */}
            <h3 className='text-white text-sm my-2 font-Lexend font-semibold line-clamp-2'>{title ? title : "New Discourse"}</h3>
            {/* divider */}
            <div className='w-full mx-1 h-[0.5px] bg-[#303030] flex rounded-xl' />

            <div className="flex w-full items-center gap-2">
                <ChainTag chainId={activeChain?.id!} />
                <p className='text-[#8e8e8e] max-w-[20ch] text-[10px] font-Lexend'>Currently, only Polygon chain is supported.</p>
            </div>
        </div>
    );
}

export default CreateCard;