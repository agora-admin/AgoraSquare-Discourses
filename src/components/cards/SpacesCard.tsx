import { useContext, useState } from "react";
import { formatDate, getTime, getTimeFromDate } from "../../helper/TimeHelper";
import { useMutation, useLazyQuery } from "@apollo/client";
import { SET_WALLETADDRESS, SPEAKER_CONFIRMATION } from "../../lib/mutations";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { contractData } from "../../helper/ContractHelper";
import AppContext from "../utils/AppContext";
import { v4 as uuid } from "uuid";
import { getChainName } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import { ArrowCircleRight, ProfileCircle } from "iconsax-react";
import { TwitterIcon } from "../utils/SvgHub";

const TwitterCard = ({ spaceUrl }: { spaceUrl: string }) => {
    const [loading] = useState(false);
    return (
        <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row items-center mobile:gap-4 sm:justify-between py-6 sm:py-3 px-6 bg-[#141414] sm:border-[0.1px] sm:border-[#498CD6] rounded-t-[30px] sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="mobile:hidden">
                    <TwitterIcon color="#498CD6" width={34} height={34} />
                </div>

                <div className="sm:hidden">
                    <TwitterIcon color="#498CD6" width={50} height={50}/>
                </div>

                <div className="flex flex-col">
                    <h4 className="text-[#498CD6] mobile:text-center font-bold text-[13px]">Twitter Spaces Scheduled</h4>
                    {/*<small className="text-[11px] text-[#E5F7FFE5] mobile:text-center font-semibold"><span className="font-semibold underline">{formatDate(new Date(data[0]["scheduled_start"]))} • {getTimeFromDate(new Date(data[0]["scheduled_start"]))}</span></small>
                    */}
                </div>
            </div>
            
            <button disabled={loading} onClick={() => { navigator.clipboard.writeText(spaceUrl)} } className="flex items-center gap-2 bg-[#498CD6] rounded-2xl p-3 cursor-pointer">
                <span className="text-white text-xs font-Lexend font-medium">copy link</span>
                <ArrowCircleRight color="#FFFFFF" variant="Bulk" fill="#000"/>
            </button>
        </div>
    );
   
}

export default TwitterCard;