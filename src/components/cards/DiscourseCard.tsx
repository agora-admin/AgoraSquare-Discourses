import { Sound,Warning2 } from "iconsax-react";
import { useRouter } from "next/router";
import { getCurrencyName } from "../../Constants";
import { DiscourseStateEnum as DiscourseStateEnum, getStateTS } from "../../helper/DataHelper";
import { getFundTotal } from "../../helper/FundHelper";
import { getTime, diff_hours } from "../../helper/TimeHelper";
import { ChainIcon } from "../utils/ChainTag";
import { ClockIcon, IRLIcon, MessageRemoveIcon, VerifyIcon, VirtualIcon } from "../utils/SvgHub";

const DiscourseCard = ({ data }: { data: any }) => { 

    console.log("Discourse Name: ",data.title," Discourse State: ",data.status)
    const route = useRouter();

    const handleClick = () => {
        route.push(`/${data.id}`)
    }

    const getDiscourseState = () => {
        if(data.status.completed){
            return <small className="text-[#84B9D1] font-semibold text-sm">Completed</small>
        }else if(data.status.terminated){
            return <small className="text-[#84B9D1] font-semibold text-sm">Terminated</small>
        }else if(data.status.disputed){
            return <small className="text-[#84B9D1] font-semibold text-sm">Disputed</small>
        }else {
            return <small className="text-[#84B9D1] font-semibold text-sm xs:text-base">{diff_hours(getTime(data.endTS),new Date())} <span className="font-Lexend text-[#E5F7FF] text-[10px] xs:text-xs">hrs left</span></small>
        }
    }

    const getDiscourseStateTitle = (state: DiscourseStateEnum) => {
        switch(state){
            case DiscourseStateEnum.SCHEDULED:
                return "Scheduled"
            case DiscourseStateEnum.SCHEDULING:
                return "Scheduling"
            case DiscourseStateEnum.FUNDING:
                return "Funding"
            case DiscourseStateEnum.FINISHED:
                return "Finished"
            case DiscourseStateEnum.TERMINATED:
                return "Terminated"
            case DiscourseStateEnum.DISPUTED:
                return "Disputed"
            case DiscourseStateEnum.ONGOING:
                return "On Going"
        }
    }

    const getDiscourseStateIcon = (state: DiscourseStateEnum) => {
        switch(state){
            case DiscourseStateEnum.SCHEDULED:
            case DiscourseStateEnum.SCHEDULING:
            case DiscourseStateEnum.FUNDING:
                return <ClockIcon size={23} />
            case DiscourseStateEnum.FINISHED:
                return <VerifyIcon size={23} />
            case DiscourseStateEnum.TERMINATED:
                return <MessageRemoveIcon size={23} />
            case DiscourseStateEnum.DISPUTED:
                return <Warning2 color="#FC8181" size={20} variant="Bold" />
            case DiscourseStateEnum.ONGOING:
                return <Sound color="#12D8FA" size={20} variant="Bold" />      
        }
    }

    return (
        <div onClick={handleClick} className='cursor-pointer relative w-full h-full bg-[#0A0A0A] rounded-xl p-4 flex flex-col gap-3 justify-center'>
            {/* Top Section */}
            <div className="flex items-center justify-between">
                <div className="bg-[#141414] rounded-2xl flex items-center p-3">
                    <div className="relative flex items-center">
                        <img className="scale-105 h-8 w-8 xs:w-10 xs:h-10 object-cover rounded-xl object-center" src={data.speakers[0]?.image_url!} alt="user profile image" />
                        <img className="relative top-0 right-3 scale-105 h-8 w-8 xs:w-10 xs:h-10 object-cover rounded-xl object-center" src={data.speakers[1]?.image_url!} alt="user profile image" />
                    </div>

                    <div className="flex flex-col justify-center">
                        <small className="font-Lexend text-[10px] xs:text-xs text-[#E5F7FF] font-medium max-w-[15ch] line-clamp-1">{data.speakers[0]?.name}</small>
                        <small className="font-Lexend text-[10px] xs:text-xs text-[#E5F7FF] font-medium max-w-[15ch] line-clamp-1">{data.speakers[1]?.name}</small>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div title={getDiscourseStateTitle(getStateTS(data))}>
                        {getDiscourseStateIcon(getStateTS(data))}
                    </div>
                    <div className="h-4 w-[1px] bg-[#1E1E1E]"/>
                    <ChainIcon chainId={data.chainId} size={20} />
                </div>
            </div>

            {/* Body Section */}
            <div className="flex-1 mb-5 text-white font-Lexend font-medium text-xs">{data.title}</div>

            {/* Stats Section */}
            <div className="flex flex-col gap-2">
                {/* Divider */}
                <div className="w-full h-[1px] bg-[#1E1E1E]" />

                <div className="flex items-center justify-between">
                    {/* Fund Column */}
                    <small className="text-[#84B9D1] font-semibold text-sm xs:text-base">{getFundTotal(data.funds)} <span className="font-Lexend text-[#E5F7FF] text-[10px] xs:text-xs">{getCurrencyName(data.chainId)}</span></small>
                    
                    <div className="h-4 w-[1px] bg-[#1E1E1E]"/>

                    {/* Time Left Column */}
                    {getDiscourseState()}
                    
                    <div className="h-4 w-[1px] bg-[#1E1E1E]"/>

                    {/* Type of discourse Column */}
                    <div className="flex items-center gap-1">
                        {data?.irl ? 
                            <>
                                <IRLIcon size={23} />
                                <span className="font-Lexend font-medium text-xs text-[#FCB4BD]">IRL</span>
                            </> : 
                            <>
                                <VirtualIcon size={23} />
                                <span className="font-Lexend font-medium text-xs text-[#FCB4F5]">VIRTUAL</span>
                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiscourseCard;