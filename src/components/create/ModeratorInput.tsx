import { Dispatch, FC, SetStateAction, useState } from "react";
import { Moderator } from "../../lib/Types";
import { SpeakerCard } from "./SpeakerInput";
import SpeakerPop from "./SpeakerPop";

interface Props {
    moderator: Moderator | null;
    setModerator: Dispatch<SetStateAction<Moderator | null>>;
}

const ModeratorInput: FC<Props> = ({ moderator,setModerator }) => {
    const addModerator = (moderator: Moderator) => {
        setModerator(moderator);
    }

    const removeModerator = () => {
        setModerator(null);
    }
    
    return (
        <div className="w-full max-w-[585px] grid grid-cols-1 items-center sm:grid-cols-2 gap-4 grid-flow-row">
            {
                moderator ? 
                <SpeakerCard speaker={moderator} removeSpeaker={removeModerator} />
                :<SpeakerPop flag={false} setSpeakers={addModerator} />
            }
        </div>
    );
}

export default ModeratorInput