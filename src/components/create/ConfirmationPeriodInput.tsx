import { Dispatch, FC, SetStateAction, useState } from "react";

interface Props {
    confirmationPeriod: number;
    setConfirmationPeriod: Dispatch<SetStateAction<number>>;
}

const btnCSS = "h-[40px] sm:h-[44px] w-[41px] sm:w-[45px] cursor-pointer rounded-xl text-[#7D8B92] font-semibold text-[10px] sm:text-xs border-2 border-[#1E1E1E]";

const ConfirmationPeriodInput: FC<Props> = ({confirmationPeriod, setConfirmationPeriod}) => {
    const [selectedBtn,setSelectedBtn] = useState('');

    const selectedBtnStyle = (btn: string) => {
        return selectedBtn === btn ? " bg-[#D2B4FC] !text-white !font-bold" : "";
    }

    return (
        <div className="flex flex-col xs2:flex-row w-full gap-2 xs2:gap-4"> 
            <div className="flex flex-col max-w-[200px] w-full">
                <input value={confirmationPeriod === 0 ? "s": confirmationPeriod} onChange={(e) => setConfirmationPeriod(parseInt(e.target.value))} className="input-s text-white/80 h-max text-xs max-w-[200px]" type="number" placeholder="In Seconds" />
                { confirmationPeriod >= 24*60*60 && <span className="text-white/30 text-[10px] px-2 py-1 font-Lexend">{getPeriodFromSeconds(confirmationPeriod)}</span>}
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => {
                    setSelectedBtn('7d')
                    setConfirmationPeriod(7*24*60*60)
                }} className={btnCSS+selectedBtnStyle('7d')}>
                    7d
                </button>

                <button onClick={() => {
                    setConfirmationPeriod(14*24*60*60)
                    setSelectedBtn('2w')
                }} className={btnCSS+selectedBtnStyle('2w')}>
                    2w
                </button>

                <button onClick={() => {
                    setConfirmationPeriod(21*24*60*60)
                    setSelectedBtn('3w')
                }} className={btnCSS+selectedBtnStyle('3w')}>
                    3w
                </button>

                <button onClick={() => {
                    setConfirmationPeriod(31*24*60*60)
                    setSelectedBtn('1m')
                }} className={btnCSS+selectedBtnStyle('1m')}>
                    1m
                </button>
            </div>
        </div>
    );
}

const getPeriodFromSeconds = (seconds: number) => {
    let Period = "~ ";
    if (seconds >= 2628000) {
        let m = Math.floor(seconds / 2628000)
        Period += m < 2 ? `${m} month ` : `${m} months `;
        seconds = seconds % 2628000;
    }
    if (seconds >= 604800 && seconds < 2628000) {
        let w = Math.floor(seconds / 604800)
        Period += w < 2 ? `${w} week ` : `${w} weeks `;
        seconds = seconds % 604800;
    }
    if (seconds >= 86400 && seconds < 604800) {
        let d = Math.floor(seconds / 86400)
        Period += d < 2 ? `${d} day` : `${d} days`;
        seconds = seconds % 86400;
    }

    return Period;
}

export default ConfirmationPeriodInput;