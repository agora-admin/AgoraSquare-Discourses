import { CloseCircle } from "iconsax-react";
import { Dispatch, FC, SetStateAction, useContext, useState } from "react";
import { uuid } from "uuidv4";
import { Speaker, ToastTypes } from "../../lib/Types";
import AppContext from "../utils/AppContext";
import SpeakerPop from "./SpeakerPop";

interface Props {
    speakers: Speaker[];
    setSpeakers: Dispatch<SetStateAction<Speaker[]>>;
}

const SpeakerInput: FC<Props> = ({ speakers, setSpeakers }) => {
    const { addToast } = useContext(AppContext);
    const [speakerInput, setSpeakerInput] = useState("");
    const addSpeaker = (speaker: Speaker) => {
        if(speakers.find(s => s.screen_name === speaker.screen_name)){
            addToast({
                title: "Speaker already added",
                body: "Can not add same speaker twice.",
                id: uuid(),
                type: ToastTypes.error,
                duration: 6000
            })
            return;
        } else {
            setSpeakers([...speakers, speaker]);
        }
    }

    const removeSpeaker = (speaker: Speaker) => {
        setSpeakers(speakers.filter(s => s.screen_name !== speaker.screen_name));
    }
    
    return (
        <div className="w-full grid grid-cols-1 items-center sm:grid-cols-2 gap-4 grid-flow-row">
            {
                speakers.map((speaker, index) => (
                    <SpeakerCard key={index} speaker={speaker} removeSpeaker={removeSpeaker} />
                ))
            }
            { speakers.length < 2 && <SpeakerPop speakerInput={speakerInput} setSpeakerInput={setSpeakerInput} setSpeakers={addSpeaker} />}
        </div>
    );
}

interface CardProps {
    speaker: Speaker;
    removeSpeaker: (speaker: Speaker) => void;
}

const SpeakerCard: FC<CardProps> = ({ speaker, removeSpeaker }) => {
    return(
        <div className="w-full bg-[#0b0b0b] rounded-lg ring-[1px] ring-[#212427] p-4 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-4">
                    <div className='flex items-center w-8 h-8 rounded-xl overflow-clip'>
                        <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={speaker?.profile_image_url!} alt="" />
                    </div>
                    <div className="flex flex-col">
                        <h4 className='text-[#fff] text-xs tracking-wide font-medium line-clamp-1'>{speaker?.name}</h4>
                        <h4 className='text-[#8e8e8e] text-xs tracking-wide font-medium line-clamp-1'>@{speaker?.screen_name}</h4>
                    </div>
                </div>
                <button onClick={() => removeSpeaker(speaker)} className="button-i">
                    <CloseCircle size={20} color="#5f5f5f" />
                </button>
            </div>
    )
}

export default SpeakerInput;