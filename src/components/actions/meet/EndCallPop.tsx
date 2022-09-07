import { Popover } from "@headlessui/react";
import { ArrowRight2, BoxSearch, CallSlash, PathTool, Profile2User } from "iconsax-react";
import { getFundTotal } from "../../../helper/FundHelper";
import { shortAddress } from "../../../helper/StringHelper";
import { getAgo, getAgoT } from "../../../helper/TimeHelper";

const EndCallPop = ({rejectEndCall, endRoom} : {rejectEndCall: () => void, endRoom: () => void}) => {
    return (
        <Popover className="relative">
                <>
                    <Popover.Button as="div" className={`t-all text-white/30 rounded-xl font-Lexend text-xs  px-4 py-2 flex items-center gap-2`}>End Call? </Popover.Button>
                    <Popover.Panel static className="absolute z-10 right-0 bg-card bg-[#141515] p-4 rounded-xl backdrop-blur-lg max-w-[200px] w-[400px]">
                        <div className="flex flex-col gap-2 ">
                            <p className="text-xs font-Lexend text-[#c6c6c6]">Other speaker requested to end the call.</p>
                            <div className="flex items-center justify-between gap-1">
                            <button onClick={endRoom} className="text-sm button-i hover:bg-[#fc8181]/60 px-4 flex-1 flex text-center items-center justify-center gap-2 font-Lexend text-[#212427] bg-[#fc8181]"> End </button>
                            <button onClick={rejectEndCall} className="text-sm button-i px-4 flex items-center gap-2 flex-1 font-Lexend text-center text-[#797979] bg-[#212427]"> Cancel </button>
                            </div>
                        </div>
                    </Popover.Panel>
                </>
            
        </Popover>
    );
}

export default EndCallPop;