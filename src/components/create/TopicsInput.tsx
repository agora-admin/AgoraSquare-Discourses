import { Add, CloseCircle } from "iconsax-react";
import { FC, useEffect, useState } from "react";

interface Props {
    topics: string[];
    addTopic: (topic: string) => void;
    removeTopic: (topic: string) => void;
}

const TopicsInput: FC<Props> = ({ topics, addTopic, removeTopic }) => {
    const [topic, setTopic] = useState("");
    const [error, setError] = useState("");

    const handleAddTopic = (t: string) => {
        if(topics.some(topic => topic.toLowerCase() === t.toLowerCase())) {
            setError("Topic already exists");
            return;
        } else {
            addTopic(t);
            setTopic("");
            setError("");
        };
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAddTopic(topic);
        }
    }

    useEffect(() => {
        var timerTask = setTimeout(() => {
            setError("")
        }, 6000);
        if (error === "") {
            clearTimeout(timerTask)
        }
    }, [error])

    return (
        <div className="w-full grid grid-cols-1 items-center sm:grid-cols-2 gap-4 grid-flow-row">
            {
                topics.map((topic, index) => (
                    <div key={index} className="w-full bg-[#0b0b0b] rounded-lg ring-[1px] ring-[#212427] py-2 px-4 flex items-center gap-2 justify-between h-full" >
                        <p className="text-[12px] text-white line-clamp-2 font-Lexend">{topic}</p>
                        <button onClick={() => removeTopic(topic)} className="button-i">
                            <CloseCircle size={20} color="#5f5f5f" />
                        </button>
                    </div>
                ))
            }
            <div className="w-full flex relative" >
                <input value={topic} onKeyDown={handleKeyDown} onChange={(e) => setTopic(e.target.value)} className="input-s text-white/80 text-xs w-full py-3" type="text" placeholder="another sub-topic" />
                { topic && <button onClick={() => handleAddTopic(topic)} className="button-i absolute inset-y-0  right-1 h-max my-auto">
                    <Add size={20} color="#5f5f5f" />
                </button>}
                {
                    error && <p className="text-red-400 text-xs font-Lexend px-2 w-full absolute bottom-[-20px]">{error}</p>
                }
            </div>
        </div>
    );
}

export default TopicsInput;