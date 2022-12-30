import { useQuery } from "@apollo/client";
import { Location } from "iconsax-react";
import { FC } from "react";
import { formatDate, getDayFromDate, getTimeFromDate } from "../../helper/TimeHelper";
import { GET_EVENT } from "../../lib/queries";

interface Props {
    spacesData: Promise<JSON>;
}
const VenueCard: FC<Props> = ({ spacesData }) => {
    var valid = false;
    if (spacesData.hasOwnProperty('data')) {
        valid = true;
    }

    return (
        <div className="flex flex-col gap-2">
            <small className="text-[#7D8B92] font-Lexend font-semibold">twitter space info</small> 
            {valid && <>
                <div className="flex flex-col">
                    <p className="text-xs text-[#fff]">{formatDate(new Date(spacesData["data"][0]["scheduled_start"]))} , {new Date(spacesData["data"][0]["scheduled_start"])}</p>
                    <p className="text-xs text-[#fff]">{getTimeFromDate(new Date(spacesData["data"][0]["scheduled_start"]))}</p>
                </div>

                <div className="flex flex-col">
                    <p className="text-xs text-[#fff]">{spacesData["data"][0]["title"]}</p>
                    <p className="text-xs text-[#fff]">Status: {spacesData["data"][0]["state"]}</p>
                  
                </div>
            </>}
            { !valid && <>
                <div className="flex flex-col">
                    <p className="text-xs text-[#797979]">No space scheduled yet</p>
                </div>
            </>}
        </div>
    );
}

export default VenueCard;