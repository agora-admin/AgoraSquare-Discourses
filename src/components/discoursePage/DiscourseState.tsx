import { ArrowCircleRight, ProfileTick } from 'iconsax-react';
import Link from 'next/link';
import {useContext} from 'react';
import { canClaimC, discourseConfirmed, DiscourseStateEnum, fundingDone, getStateTS, hasWithdrawn, isSpeaker, isSpeakerWallet, speakerConfirmed } from "../../helper/DataHelper";
import AreYouSpeakerCard from '../actions/AreYouSpeakerCard';
import FundClaimCardC from '../actions/FundClaimCardC';
import FundClaimCardT from '../actions/FundClaimCardT';
import JoinMeetCard from '../actions/meet/JoinMeetCard';
import SlotCard from '../actions/SlotCard';
import SpeakerConfirmationCard from '../actions/SpeakerConfirmationCard';
import AppContext from "../utils/AppContext";
import { WalletIcon } from '../utils/SvgHub';

const DiscourseState = ({ data,slotConfirmed }: { data: any,slotConfirmed: (data:any) => boolean }) => {
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

        { !data.getDiscourseById.irl && data.getSlotById && discourseConfirmed(data.getDiscourseById) && isSpeakerWallet(data, walletAddress) && getStateTS(data.getDiscourseById) === 1 &&
            <SlotCard id={data.getDiscourseById.id} propId={+data.getDiscourseById.propId} chainId={+data.getDiscourseById.chainId} endTS={+data.getDiscourseById.endTS} data={data.getSlotById} />
        }
        
        {/* Speaker Confirmation */}
        {!fundingDone(data.getDiscourseById) && loggedIn && t_connected && isSpeaker(data.getDiscourseById, t_handle) && !speakerConfirmed(data.getDiscourseById, t_handle) && !slotConfirmed(data.getDiscourseById) &&
            <SpeakerConfirmationCard data={data.getDiscourseById} />
        }

        {/* Confirmation Message */}
        {
            !fundingDone(data.getDiscourseById) && loggedIn && t_connected && isSpeaker(data.getDiscourseById, t_handle) && speakerConfirmed(data.getDiscourseById, t_handle) && !slotConfirmed(data.getDiscourseById) &&
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

        {
            !loggedIn &&
            <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row mobile:gap-4 items-center sm:justify-between py-6 sm:py-3 sm:px-4 bg-[#141414] sm:border-[1.2px] sm:border-[#84B9D1] rounded-t-[30px] sm:rounded-3xl">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <div className="mobile:hidden">
                        <WalletIcon size={30}/>
                    </div>

                    <div className="sm:hidden">
                        <WalletIcon size={40}/>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="text-[#84B9D1] font-bold text-[13px] sm:text-sm">Connect Wallet To Fund Discourse</h4>
                    </div>
                </div>

                <Link href="/link" passHref>
                    <button className="flex items-center gap-2 bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                        <span className="text-black text-xs font-Lexend font-medium">Connect Wallet</span>
                        <ArrowCircleRight variant="Bulk" fill="#000"/>
                    </button>
                </Link>
            </div>
        }
    </div>
  );
};

export default DiscourseState;
