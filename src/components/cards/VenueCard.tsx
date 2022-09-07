import { useQuery } from "@apollo/client";
import { Location } from "iconsax-react";
import { FC } from "react";
import { formatDate, getDayFromDate, getTimeFromDate } from "../../helper/TimeHelper";
import { GET_EVENT } from "../../lib/queries";

interface Props {
    chainId: number;
    propId: number;
}
const VenueCard: FC<Props> = ({ chainId, propId }) => {

    const { data, loading, error } = useQuery(GET_EVENT, {
        variables: { chainId, propId }
    })

    return (
        <div className="bg-card rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Location size={16} color="#797979" />
                <p className="text-[#797979] font-Lexend text-sm">Venue and Date</p>
            </div>
            {data && !loading && !error && <>
                <div className="flex flex-col">
                    <p className="text-xs font-Lexend text-[#c6c6c6]">{formatDate(new Date(data.getEvent?.eventTimestamp))} , {getDayFromDate(new Date(data.getEvent?.eventTimestamp))}</p>
                    <p className="text-xs font-Lexend text-[#c6c6c6]">{getTimeFromDate(new Date(data.getEvent?.eventTimestamp))}</p>
                </div>

                <div className="flex flex-col">
                    <p className="text-xs font-Lexend text-[#c6c6c6]">{data.getEvent?.venue.name}</p>
                    <p className="text-xs font-Lexend text-[#c6c6c6]">{data.getEvent?.venue.address}</p>
                    <p className="text-xs font-Lexend text-[#c6c6c6]">{data.getEvent?.venue.city}, {data.getEvent?.venue.state}, {data.getEvent?.venue.country}</p>
                    <p className="text-xs font-Lexend text-[#c6c6c6]">{data.getEvent?.venue.zip}</p>
                </div>
            </>}
            { loading && <>
                <div className="flex flex-col">
                    <p className="text-xs font-Lexend text-[#797979]">Loading...</p>
                </div>
            </>}
            { error && <>
                <div className="flex flex-col">
                    <p className="text-xs font-Lexend text-[#797979]">Yet to be finalized</p>
                </div>
            </>}
        </div>
    );
}

export default VenueCard;