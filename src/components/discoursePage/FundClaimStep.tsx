import { useContext } from "react";
import { canClaimC, discourseConfirmed, DiscourseStateEnum, fundingDone, getFundClaimDate, getStateTS, hasWithdrawn } from "../../helper/DataHelper"
import FundClaimCardC from "../actions/FundClaimCardC"
import FundClaimCardT from "../actions/FundClaimCardT"
import ParticipantClaimCard from "../campaign/ParticipantClaimCard"
import { useDiscourseFormat } from "../../web3/agora"
import AppContext from "../utils/AppContext";

const FundClaimStep = ({data}:{data:any}) => {
    const { walletAddress } = useContext(AppContext);

    // Additive branch (docs/PRD.md §4, additive-only): an Agora campaign pays per roster index
    // through `participantWithdraw`, and the two legacy cards below call `speakerWithdraw` /
    // `proposerWithdraw`, which are unreachable for format 1 (docs/eng/03 §3.1 F4). When the read
    // is unavailable `format` is null and every legacy branch behaves exactly as before.
    const { format } = useDiscourseFormat(data?.getDiscourseById?.propId);

    if (format === 1) {
        return (
            <>
                <ParticipantClaimCard
                    propId={data.getDiscourseById.propId}
                    chainId={Number(data.getDiscourseById.chainId)}
                    claimOpensAt={Math.floor(getFundClaimDate(data.getDiscourseById).getTime() / 1000)}
                    disputed={Boolean(data.getDiscourseById.status?.disputed)}
                />
                <div className="pb-24" />
            </>
        );
    }

    return (
        <>
        {
            !discourseConfirmed(data.getDiscourseById) && fundingDone(data.getDiscourseById) && 
            <FundClaimCardT data={data.getDiscourseById} />
        }

        {
            getStateTS(data.getDiscourseById) === DiscourseStateEnum.FINISHED && canClaimC(data.getDiscourseById, walletAddress) && !hasWithdrawn(data.getDiscourseById, walletAddress) && 
            <FundClaimCardC data={data.getDiscourseById} />
        }
        </>
    )
}

export default FundClaimStep;