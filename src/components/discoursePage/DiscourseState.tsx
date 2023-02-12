import { useContext } from 'react';
import { discourseConfirmed,DiscourseStateEnum,getStateTS,isSpeakerWallet } from "../../helper/DataHelper";
import AreYouSpeakerCard from '../actions/AreYouSpeakerCard';
import SlotCard from '../actions/SlotCard';
import AppContext from "../utils/AppContext";
import ConfirmationStep from './ConfirmationStep';
import ConnectWalletCard from './ConnectWalletCard';
import FundClaimStep from './FundClaimStep';
import JoinMeetStep from './JoinMeetStep';

const DiscourseState = ({ discourseData,slotConfirmed }: { discourseData:any,slotConfirmed: (data:any) => boolean }) => {
    const { loggedIn, walletAddress, t_connected } = useContext(AppContext);
    
    return (
    <div className='sm:mb-6 flex flex-col gap-6'>
        { !loggedIn && <ConnectWalletCard /> }

        {
            loggedIn && !t_connected && getStateTS(discourseData.getDiscourseById) !== DiscourseStateEnum.TERMINATED &&
            <AreYouSpeakerCard />
        }

        <ConfirmationStep discourseData={discourseData} slotConfirmed={slotConfirmed} />

        {/* For Scheduling The Discourse */}
        {   
            discourseConfirmed(discourseData.getDiscourseById) && isSpeakerWallet(discourseData.getDiscourseById, walletAddress) && getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULING && !discourseData.getDiscourseById.irl &&
            <SlotCard id={discourseData.getDiscourseById.id} propId={+discourseData.getDiscourseById.propId} chainId={+discourseData.getDiscourseById.chainId} endTS={+discourseData.getDiscourseById.endTS} data={discourseData.getSlotById} />
        }

        <JoinMeetStep data={discourseData} slotConfirmed={slotConfirmed}/>
        <FundClaimStep data={discourseData} />
    </div>
  );
};

export default DiscourseState;
