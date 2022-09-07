import { Dispatch, FC, SetStateAction, useState } from "react";

interface Props {
    fundingPeriod: number;
    setFundingPeriod: Dispatch<SetStateAction<number>>;
}
const FundingInput: FC<Props> = ({fundingPeriod, setFundingPeriod}) => {
    return (
        <div className="flex flex-col sm:flex-row w-full gap-4"> 
            <div className="flex flex-col max-w-[200px] w-full">
                <input value={fundingPeriod === 0 ? "s": fundingPeriod} onChange={(e) => setFundingPeriod(parseInt(e.target.value))} className="input-s text-white/80 h-max text-xs max-w-[200px] py-3" type="number" placeholder="Seconds" />
                { fundingPeriod >= 24*60*60 && <span className="text-white/30 text-[10px] px-2 py-1 font-Lexend">{getPeriodFromSeconds(fundingPeriod)}</span>}
                
            </div>
            <div className="flex flex-col">
            <p className="text-[12px] text-[#8e8e8e] font-Lexend">
                Funding period is the time till which funding to this discourse will be active. It needs to be in seconds. You can pick from options below or fill a custom period in seconds.
                For example: 7days will be 7 * 24 * 60 * 60 = 604800 seconds. 
                { <span className="text-[#c6c6c6]/40 font-Lexend"> we recommend between 7 days to 1 month i.e. 604800s - 2628000s</span>}
            </p>
            <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => setFundingPeriod(7*24*60*60)} className="button-o group px-2">
                        <p className="text-[10px] font-Lexend text-[#c6c6c6] group-hover:text-white t-all w-max">7 D</p>
                    </button>
                    <button onClick={() => setFundingPeriod(14*24*60*60)} className="button-o group px-2">
                        <p className="text-[10px] font-Lexend text-[#c6c6c6] group-hover:text-white t-all w-max">2 W</p>
                    </button>
                    <button onClick={() => setFundingPeriod(21*24*60*60)} className="button-o group px-2">
                        <p className="text-[10px] font-Lexend text-[#c6c6c6] group-hover:text-white t-all w-max">3 W</p>
                    </button>
                    <button onClick={() => setFundingPeriod(31*24*60*60)} className="button-o group px-2">
                        <p className="text-[10px] font-Lexend text-[#c6c6c6] group-hover:text-white t-all w-max">1 M</p>
                    </button>
                </div>
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

export default FundingInput;