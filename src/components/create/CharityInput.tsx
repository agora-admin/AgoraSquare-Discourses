import { Dispatch, FC, SetStateAction,useState } from "react";

interface Props {
    charityPercentage: number;
    setCharityPercentage: Dispatch<SetStateAction<number>>;
}

const btnCSS = "h-[40px] sm:h-[44px] w-[41px] sm:w-[45px] cursor-pointer rounded-xl text-[#7D8B92] font-semibold text-[10px] sm:text-xs border-2 border-[#1E1E1E]";

const CharityInput: FC<Props> = ({charityPercentage, setCharityPercentage}) => {
    const [selectedBtn,setSelectedBtn] = useState('');

    const selectedBtnStyle = (btn: string) => {
        return selectedBtn === btn ? " bg-[#D2B4FC] !text-white !font-bold" : "";
    }

    return (
        <div className="flex flex-col xs2:flex-row xs2:items-center w-full gap-4">      
            <input min={1} max={100} value={charityPercentage === 0 ? "%" : charityPercentage} onChange={(e) => setCharityPercentage(parseInt(e.target.value))} className="input-s text-white/80 h-max text-xs max-w-[150px]" type="number" placeholder="%" />

            <div className="flex items-center gap-2">
                <button onClick={() => {
                    setSelectedBtn('20%')
                    setCharityPercentage(20)
                }} className={btnCSS+selectedBtnStyle('20%')}>
                    20%
                </button>

                <button onClick={() => {
                    setCharityPercentage(40)
                    setSelectedBtn('40%')
                }} className={btnCSS+selectedBtnStyle('40%')}>
                    40%
                </button>

                <button onClick={() => {
                    setCharityPercentage(60)
                    setSelectedBtn('60%')
                }} className={btnCSS+selectedBtnStyle('60%')}>
                    60%
                </button>

                <button onClick={() => {
                    setCharityPercentage(80)
                    setSelectedBtn('80%')
                }} className={btnCSS+selectedBtnStyle('80%')}>
                    80%
                </button>
            </div>
        </div>
    );
}

export default CharityInput;