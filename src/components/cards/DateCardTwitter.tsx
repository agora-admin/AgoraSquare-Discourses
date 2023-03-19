import { useQuery } from "@apollo/client";
import { FC } from "react";
import { formatDate, getDayFromDate, getTimeFromDate } from "../../helper/TimeHelper";
import { GET_EVENT } from "../../lib/queries";

interface Props {
    chainId: number;
    propId: number;
}

const DateCardTwitter: FC<Props> = ({ chainId, propId }) => {
    const { data, loading, error } = useQuery(GET_EVENT, {
        variables: { chainId, propId }
    })

    return (
        <div className="flex flex-col gap-2">
            <small className="text-[#7D8B92] font-Lexend font-semibold">time & date</small> 
            {data && !loading && !error && <>
                <div className="flex flex-col">
                    <p className="text-xs text-[#fff]">{formatDate(new Date(data.getEvent?.eventTimestamp))} , {getDayFromDate(new Date(data.getEvent?.eventTimestamp))}</p>
                    <p className="text-xs text-[#fff]">{getTimeFromDate(new Date(data.getEvent?.eventTimestamp))}</p>
                </div>
            </>}
            { loading && <>
                <div className="flex flex-col">
                    <p className="text-xs text-[#797979]">Loading...</p>
                </div>
            </>}
            { error && <>
                <div className="flex flex-col">
                    <p className="text-xs text-[#797979]">Yet to be finalized</p>
                </div>
            </>}
        </div>
    );
}

export default DateCardTwitter;