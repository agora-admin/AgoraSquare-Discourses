import { CloseCircle, ProfileTick } from "iconsax-react";
import { useContext } from "react";
import { confirmationPeriodDone, isSpeaker, speakerConfirmed } from "../../helper/DataHelper";
import SpeakerConfirmationCard from "../actions/SpeakerConfirmationCard";
import AppContext from "../utils/AppContext";

const ConfirmationStep = ({ discourseData,slotConfirmed }:{discourseData: any,slotConfirmed: (data:any) => boolean}) => {
    const { loggedIn, t_connected, t_handle } = useContext(AppContext);

    return (
        <>
        {
            loggedIn && t_connected && isSpeaker(discourseData.getDiscourseById, t_handle) && !speakerConfirmed(discourseData.getDiscourseById, t_handle) && !confirmationPeriodDone(discourseData?.getDiscourseById) && !slotConfirmed(discourseData.getDiscourseById) &&
            <SpeakerConfirmationCard discourseData={discourseData.getDiscourseById} />
        }

        {/* IF Confirmed Successfully */}
        {
            loggedIn && t_connected && isSpeaker(discourseData.getDiscourseById, t_handle) && speakerConfirmed(discourseData.getDiscourseById, t_handle) && !slotConfirmed(discourseData.getDiscourseById) &&
            <div className="flex items-center gap-1 mb-3 sm:mb-2 bg-[#141414] sm:border-[1.2px] sm:border-[#84B9D1] rounded-2xl py-3 px-5">
                <ProfileTick size="23" color="#84B9D1" variant="Bulk" />
                <small className="text-xs font-Lexend text-[#84B9D1] font-medium"> Please schedule event to complete speaker confirmation</small>
            </div>
        }

        {/* IF didn't Confirmed and period is over */}
        {
            loggedIn && t_connected && isSpeaker(discourseData.getDiscourseById, t_handle) && !speakerConfirmed(discourseData.getDiscourseById, t_handle) && confirmationPeriodDone(discourseData.getDiscourseById) && !slotConfirmed(discourseData.getDiscourseById) &&
            <div className="flex items-center gap-1 mb-3 sm:mb-2 bg-[#141414] sm:border-[1.4px] sm:border-[#7D8B92] rounded-2xl py-3 px-5">
                <CloseCircle size="23" color="#7D8B92" variant="Bulk" />
                <small className="text-xs font-Lexend text-[#7D8B92] font-medium">Confirmation Period is over.</small>
            </div>
        }
        </>
    )
}

export default ConfirmationStep;