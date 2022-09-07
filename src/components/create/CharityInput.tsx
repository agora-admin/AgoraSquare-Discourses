import { Dispatch, FC, SetStateAction } from "react";

interface Props {
    charityPercentage: number;
    setCharityPercentage: Dispatch<SetStateAction<number>>;
}
const CharityInput: FC<Props> = ({charityPercentage, setCharityPercentage}) => {
    return (
        <div className="flex flex-col sm:flex-row w-full gap-4">      
            <input min={1} max={100} value={charityPercentage === 0 ? "%" : charityPercentage} onChange={(e) => setCharityPercentage(parseInt(e.target.value))} className="input-s text-white/80 h-max text-xs max-w-[150px] py-3" type="number" placeholder="%" />
            <p className="text-[12px] text-[#8e8e8e] font-Lexend">
                Charity percentage is the percentage of the funding that will be donated to the charities of speaker&apos;s choice. Each speaker can select a charity of their choice. Leave this field empty for non-charity discourses.
            </p>
        </div>
    );
}

export default CharityInput;