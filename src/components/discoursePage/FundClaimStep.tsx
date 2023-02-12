import { useContext } from "react";
import { canClaimC, discourseConfirmed, DiscourseStateEnum, fundingDone, getStateTS, hasWithdrawn } from "../../helper/DataHelper"
import FundClaimCardC from "../actions/FundClaimCardC"
import FundClaimCardT from "../actions/FundClaimCardT"
import AppContext from "../utils/AppContext";

const FundClaimStep = ({data}:{data:any}) => {
    const { walletAddress } = useContext(AppContext);

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