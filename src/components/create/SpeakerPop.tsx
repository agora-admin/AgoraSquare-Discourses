import { Dispatch, FC, SetStateAction, useState } from "react";
import { useDebounce } from "react-use";
import { Popover } from '@headlessui/react';
import useTwitterProfile from "../../hooks/useTwitterProfile";

interface Props {
    speakerInput: string;
    setSpeakerInput: Dispatch<SetStateAction<string>>;
    setSpeakers: (speaker: Speaker) => void;
}


const SpeakerPop: FC<Props> = ({ setSpeakers }) => {
    const [speakerInput, setSpeakerInput] = useState("");
    const [state, setState] = useState(0);
    const [val, setVal] = useState("");
    const [focused, setFocused] = useState(false);
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    const {profile:u, loading} = useTwitterProfile(speakerInput);
    const [, cancel] = useDebounce(
        () => {
            setState(0);
            setSpeakerInput(val);
        },
        2000,
        [val]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && u.profile_image_url !== `https://avatar.tobi.sh/${u.screen_name}` && !loading) {
            setSpeakers(u);
            setVal("");
            setSpeakerInput("");
        }
    }

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button as="div" className="flex">
                        <input onFocus={onFocus} onKeyDown={handleKeyDown} onBlur={onBlur} type="text" className="input-s w-full py-3" placeholder="Speaker's twitter handle" value={val} onChange={(e) => {
                            setState(1);
                            setVal(e.target.value);
                        }} />
                    </Popover.Button>
                    {val &&
                        <div>
                            <Popover.Panel static className="absolute z-20 mt-2 w-full" >
                                {val.length < 4 && <div className="flex items-center justify-center rounded-lg p-4 bg-[#000] ring-[1px] ring-[#313131]">
                                    <p className="text-xs font-Lexend text-[#c6c6c6]">Enter the twitter handle.</p>
                                </div>}
                                {val.length >= 4 && (state === 1 || loading) && <div className="flex items-center justify-center rounded-lg p-4 bg-[#000] ring-[1px] ring-[#313131]">
                                    <p className="text-xs font-Lexend text-[#c6c6c6]">Looking for username...</p>
                                </div>}
                                {val.length >= 4 && state === 0 && !loading &&
                                    <SpeakerCard speaker={u} setSpeakers={setSpeakers} setSpeakerInput={setSpeakerInput} setVal={setVal} />}
                            </Popover.Panel>
                        </div>
                    }
                </>
            )}
        </Popover>
    );
}

interface CardProps {
    speaker: Speaker;
    setSpeakers: (speaker: Speaker) => void;
    setSpeakerInput: Dispatch<SetStateAction<string>>;
    setVal: Dispatch<SetStateAction<string>>;
}
interface Speaker {
    screen_name: string;
    name: string;
    profile_image_url: string;
}

const SpeakerCard: FC<CardProps> = ({ speaker, setSpeakers, setVal, setSpeakerInput }) => {
    
    const handleOnClick = () => {
        setSpeakers(speaker);
        setVal("");
        setSpeakerInput("");
    }

    if (speaker.screen_name === speaker.name && speaker.profile_image_url === `https://avatar.tobi.sh/${speaker.screen_name}`) {
        return (
            <div className="flex items-center justify-center rounded-lg p-4 bg-[#000] ring-[1px] ring-[#313131]">
                <p className="text-xs font-Lexend text-[#c6c6c6]">User not found on Twitter</p>
            </div>
        )
    }
    
    return (
        <button onClick={() => handleOnClick()} className="outline-none w-full flex items-center hover:bg-[#212427] rounded-lg p-4 bg-[#000] ring-[1px] ring-[#313131]">
            <div className="flex items-center gap-4">
                <div className='flex items-center w-8 h-8 rounded-xl overflow-clip'>
                    <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={speaker?.profile_image_url!} alt="" />
                </div>
                <div className="flex flex-col items-start">
                    <h4 className='text-[#fff] text-xs tracking-wide font-medium line-clamp-1'>{speaker?.name}</h4>
                    <h4 className='text-[#8e8e8e] text-xs tracking-wide font-medium line-clamp-1'>@{speaker?.screen_name}</h4>
                </div>
            </div>
        </button>
    )
}

export default SpeakerPop;