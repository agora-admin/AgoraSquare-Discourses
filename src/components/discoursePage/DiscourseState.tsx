import { ProfileTick } from 'iconsax-react';
import {useContext} from 'react';
import { canClaimC, discourseConfirmed, DiscourseStateEnum, fundingDone, getStateTS, hasWithdrawn, isSpeaker, isSpeakerWallet, speakerConfirmed } from "../../helper/DataHelper";
import AreYouSpeakerCard from '../actions/AreYouSpeakerCard';
import FundClaimCardC from '../actions/FundClaimCardC';
import FundClaimCardT from '../actions/FundClaimCardT';
import JoinMeetCard from '../actions/meet/JoinMeetCard';
import SlotCard from '../actions/SlotCard';
import SpeakerConfirmationCard from '../actions/SpeakerConfirmationCard';
import AppContext from "../utils/AppContext";

const DiscourseState = ({ data,slotConfirmed }: { data:any,slotConfirmed: (data:any) => boolean }) => {
    const { loggedIn, walletAddress, t_connected, t_handle } = useContext(AppContext);
    
    return (
    <div className='sm:mb-6'>
        {/* If Discourse Terminated */}
        {
            !discourseConfirmed(data.getDiscourseById) && fundingDone(data.getDiscourseById) && 
            <FundClaimCardT data={data.getDiscourseById} />
        }
        
        {getStateTS(data.getDiscourseById) === DiscourseStateEnum.FINISHED && canClaimC(data.getDiscourseById, walletAddress) && !hasWithdrawn(data.getDiscourseById, walletAddress) && 
            <FundClaimCardC data={data.getDiscourseById} />
        }

        {slotConfirmed(data.getDiscourseById) && !data.getDiscourseById.irl && (
            <JoinMeetCard data={data.getDiscourseById} />
        )} 

        { !data.getDiscourseById.irl && data.getSlotById && fundingDone(data.getDiscourseById) && discourseConfirmed(data.getDiscourseById) && isSpeakerWallet(data, walletAddress) && getStateTS(data.getDiscourseById) === 1 &&
            <SlotCard id={data.getDiscourseById.id} propId={+data.getDiscourseById.propId} chainId={+data.getDiscourseById.chainId} endTS={+data.getDiscourseById.endTS} data={data.getSlotById} />
        }
        
        {/* Speaker Confirmation */}
        {!fundingDone(data.getDiscourseById) && loggedIn && t_connected && isSpeaker(data.getDiscourseById, t_handle) && !speakerConfirmed(data.getDiscourseById, t_handle) && !slotConfirmed(data.getDiscourseById) &&
            <SpeakerConfirmationCard data={data.getDiscourseById} />
        }

        {/* Confirmation Message */}
        {!fundingDone(data.getDiscourseById) && loggedIn && t_connected && isSpeaker(data.getDiscourseById, t_handle) && speakerConfirmed(data.getDiscourseById, t_handle) && !slotConfirmed(data.getDiscourseById) &&
            <div className="flex items-center gap-1 mb-3 sm:mb-2 bg-[#141414] sm:border-[1.2px] sm:border-[#84B9D1] rounded-2xl py-3 px-5">
                <ProfileTick size="23" color="#84B9D1" variant="Bulk" />
                <small className="text-xs font-Lexend text-[#84B9D1] font-medium">You’ve confirmed</small>
            </div>
        }

        {/* Twitter not connected */}
        {
            loggedIn && !t_connected && getStateTS(data.getDiscourseById) !== DiscourseStateEnum.TERMINATED && (
            <AreYouSpeakerCard />
        )}
    </div>
  );
};

export default DiscourseState;
