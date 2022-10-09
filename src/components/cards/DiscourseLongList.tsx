import { Wallet1, Clock, Sound, MessageRemove, Calendar1, Verify, Warning2 } from "iconsax-react";
import { useRouter } from "next/router";
import { getCurrencyName } from "../../Constants";
import { DiscourseState, getMeetDateTS, getStateTS } from "../../helper/DataHelper";
import { getFundTotal } from "../../helper/FundHelper";
import { getTime, formatDate, getTimeFromDate } from "../../helper/TimeHelper";
import { SChainTag } from "../utils/ChainTag";
import EventTag from "../utils/EventTag";

const DiscourseLongList = ({ data }: { data: any }) => {
    const route = useRouter();

    const handleClick = () => {
        route.push(`/${data.id}`)
    }
    return (
        <div onClick={handleClick} className='cursor-pointer relative w-full h-full bg-card blur-my p-4 rounded-xl flex flex-col gap-4 justify-between'>
            {/* left section */}

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex absolute top-2 right-2">
                    <EventTag irl={data.irl} />
                </div>

                {/* avatar */}
                <div className="flex gap-1">
                    <div className='flex items-center w-16 h-8 relative'>
                        <div className='flex items-center w-8 h-8 rounded-xl ring-[3px] ring-[#141515] overflow-clip'>
                            {/* TODO: add twitter fetch avatar */}
                            <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={data.speakers[0]?.image_url!} alt="" />
                        </div>
                        <div className='flex items-center absolute left-[35%] w-8 h-8 rounded-xl ring-[3px] ring-[#141515] overflow-clip'>
                            <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={data.speakers[1]?.image_url!} alt="" />
                        </div>
                    </div>
                    <div className='flex-1 flex flex-col gap-1'>
                        <h4 title={data.speakers[0]?.name} className='text-[#c6c6c6] text-[10px] tracking-wide font-medium max-w-[16ch] line-clamp-1'>{data.speakers[0]?.name}</h4>
                        <h4 title={data.speakers[1]?.name} className='text-[#c6c6c6] text-[10px] tracking-wide font-medium max-w-[16ch] line-clamp-1'>{data.speakers[1]?.name}</h4>
                    </div>
                </div>
                
                {/* title */}
                {data.title && <h3 className='mt-3 text-white font-Lexend text-xs font-medium line-clamp-2'>{data.title}</h3>}
            </div>

            {/* divider */}
            <div className='w-full mx-1 h-[1px] mt-1 bg-[#303030] flex rounded-xl' />

            <div className="flex w-full">
                <div className='flex items-center gap-4 flex-1 justify-between min-h-[36px]'>
                    <StateView state={getStateTS(data)} data={data} />
                </div>
                <div className="flex items-center justify-end gap-2 flex-1">
                    <SChainTag />
                    <p className='text-[#68D391] font-bold text-[12px]'>{getFundTotal(data.funds)} {getCurrencyName(data.chainId)}</p>
                </div>
            </div>
        </div>
    );
}

const StateView = ({ state, data }: { state: DiscourseState, data: any }) => {
    if (state === DiscourseState.FUNDING) {
        return (
            <div className='flex flex-col gap-1'>
                <div className='flex items-end gap-1'>
                    <Wallet1 size="16" color="#68D391" variant='Bold' />
                    <p className='uppercase text-[9.5px] font-Lexend text-[#68D391] tracking-wider font-medium'>funding</p>
                </div>
                <div className='flex items-center gap-1'>
                    <Clock size="16" color="#6a6a6a" variant='Bold' />
                    <p className='uppercase font-Lexend text-[9.5px] text-[#6a6a6a] tracking-wider font-semibold'>{formatDate(getTime(data.endTS))}</p>
                </div>
            </div>
        )
    }

    if (state === DiscourseState.SCHEDULING) {
        return (
            <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                    <Clock size="16" color="#6c6c6c" variant='Bold' />
                    <p className='uppercase font-Lexend text-[9.5px] text-[#6c6c6c] tracking-wider font-medium'>scheduling</p>
                </div>
            </div>
        )
    }

    if (state === DiscourseState.SCHEDULED) {
        return (
            <div className='flex flex-col gap-1'>
                <div className='flex items-end gap-2'>
                    <Calendar1 size="16" color="#F6E05E" variant='Bold' />
                    <p className='uppercase text-[9.5px] font-Lexend text-[#F6E05E] tracking-wider font-medium'>{formatDate(getTime(data.endTS))}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Clock size="16" color="#6a6a6a" variant='Bold' />
                    <p className='uppercase font-Lexend text-[9.5px] text-[#6a6a6a] tracking-wider font-semibold'> {getTimeFromDate(new Date(getMeetDateTS(data)))}</p>
                </div>
            </div>
        )
    }

    if (state === DiscourseState.FINISHED) {
        return (
            <div className='flex flex-col gap-1'>
                <div className='flex items-end gap-2'>
                    <Verify size="16" color="#ABECD6" variant='Bold' />
                    <p className='uppercase font-Lexend text-[9.5px] text-[#ABECD6] tracking-wider font-medium'>Completed</p>
                </div>
            </div>
        )
    }

    if (state === DiscourseState.TERMINATED) {
        return (
            <div className='flex flex-col gap-1'>
                <div className='flex items-end gap-2'>
                    <MessageRemove size="16" color="#FC8181" variant='Bold' />
                    <p className='uppercase font-Lexend text-[9.5px] text-[#FC8181] tracking-wider font-medium'>Terminated</p>
                </div>
            </div>
        )
    }

    if (state === DiscourseState.DISPUTED) {
        return (
            <div className='flex flex-col gap-1'>
                <div className='flex items-end gap-2'>
                    <Warning2 size="16" color="#FC8181" variant='Bold' />
                    <p className='uppercase font-Lexend text-[9.5px] text-[#FC8181] tracking-wider font-medium'>Disputed</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-1'>
            <div className='flex items-end gap-2'>
                <Sound size="16" color="#12D8FA" variant='Bold' />
                <p className='uppercase font-Lexend text-[9.5px] text-[#12D8FA] tracking-wider font-medium'>On Going</p>
            </div>
        </div>
    );
}

export default DiscourseLongList;