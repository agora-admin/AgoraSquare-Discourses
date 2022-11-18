import { ProfileTick } from 'iconsax-react';
import {useContext} from 'react';
import { canClaimC, discourseConfirmed, DiscourseStateEnum, fundingDone, getStateTS, hasWithdrawn, isSpeaker, speakerConfirmed } from "../../helper/DataHelper";
import AreYouSpeakerCard from '../actions/AreYouSpeakerCard';
import FundClaimCardC from '../actions/FundClaimCardC';
import FundClaimCardT from '../actions/FundClaimCardT';
import SpeakerConfirmationCard from '../actions/SpeakerConfirmationCard';
import AppContext from "../utils/AppContext";

const DiscourseState = ({ discourseData,slotConfirmed }: { discourseData: any,slotConfirmed: (data:any) => boolean }) => {
    const { loggedIn, walletAddress, t_connected, t_handle } = useContext(AppContext);
    
    return (
    <div className='sm:mb-6'>
        {/* If Discourse Terminated */}
        {
            !discourseConfirmed(discourseData) && fundingDone(discourseData) && 
            <FundClaimCardT data={discourseData} />
        }
        
        {getStateTS(discourseData) === DiscourseStateEnum.FINISHED && canClaimC(discourseData, walletAddress) && !hasWithdrawn(discourseData, walletAddress) && 
            <FundClaimCardC data={discourseData} />
        }

        {/* {slotConfirmed(discourseData) && !discourseData.irl && (
            <JoinMeetCard data={discourseData} />
        )}  */}
        
        {/* Speaker Confirmation */}
        {!fundingDone(discourseData) && loggedIn && t_connected && isSpeaker(discourseData, t_handle) && !speakerConfirmed(discourseData, t_handle) && !slotConfirmed(discourseData) &&
            <SpeakerConfirmationCard data={discourseData} />
        }

        {/* Confirmation Message */}
        {!fundingDone(discourseData) && loggedIn && t_connected && isSpeaker(discourseData, t_handle) && speakerConfirmed(discourseData, t_handle) && !slotConfirmed(discourseData) &&
            <div className="flex items-center gap-1 mb-3 sm:mb-2 bg-[#141414] sm:border-[1.2px] sm:border-[#84B9D1] rounded-2xl py-3 px-5">
                <ProfileTick size="23" color="#84B9D1" variant="Bulk" />
                <small className="text-xs font-Lexend text-[#84B9D1] font-medium">You’ve confirmed</small>
            </div>
        }

        {/* Twitter not connected */}
        {
            loggedIn && !t_connected && getStateTS(discourseData) !== DiscourseStateEnum.TERMINATED && (
            <AreYouSpeakerCard />
        )}
    </div>
  );
};

export default DiscourseState;
