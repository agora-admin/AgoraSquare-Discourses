import { Clock, Verify } from "iconsax-react";
import { formatDate, getTimeFromDate, isDisputable, isFuture, isPast } from "../../../helper/TimeHelper";
import { ArrowGRightIcon, ArrowRightIcon, HappeningIconGreen } from "../../utils/SvgHub";
import { GET_DISCOURSE_BY_ID, GET_TOKEN_BY_ID } from "../../../lib/queries";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { discouresEnded } from "../../../helper/DataHelper";
import DiscourseHub from '../../../web3/abi/DiscourseHub.json';
import Addresses from '../../../web3/addresses.json';
import { useLazyQuery, useMutation } from "@apollo/client";
import { ENTER_DISCOURSE, RAISE_DISPUTE } from "../../../lib/mutations";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { contractData } from "../../../helper/ContractHelper";
import AppContext from "../../utils/AppContext";
import Cookies from "js-cookie";
import { uuid } from "uuidv4";
import { getChainName } from "../../../Constants";
import { ToastTypes } from "../../../lib/Types";

const JoinMeetCard = ({ data }: { data: any }) => {
    const route = useRouter();

    const [token, setToken] = useState("");

    const { addToast, loggedIn, walletAddress, setMPropId, setMTimeStamp, timeStamp, propId } = useContext(AppContext);

    const [loading, setLoading] = useState(false);
    const { activeChain } = useNetwork();

    var d = data.discourse
    const isMeetHappening = () => {
        if (d.room_id !== "" && !d.ended) {
            return true;
        }
        return false;
    }


    const [getMeetToken, { data: tokenData, loading: tLoading, error: tError }] = useLazyQuery(GET_TOKEN_BY_ID, {
        variables: {
            id: data.id
        },
        onCompleted: (data) => {
            if (data) {
                const token = Cookies.get('meetToken') + "";
                setToken(token);
            }
        }
    })

    const [refetch] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: data.id
        }
    })

    const [enterMeet] = useMutation(ENTER_DISCOURSE, {
        variables: {
            propId: data.propId,
            chainId: data.chainId
        },
        onCompleted: () => {
            refetch();
            joinMeet();
        }
    })

    const [raiseD] = useMutation(RAISE_DISPUTE, {
        variables: {
            propId: data.propId,
            chainId: data.chainId
        },
        onCompleted: () => {
            refetch();
            addToast({
                title: "Vote Submitted",
                body: `You've disputed this discourse. Once the quorum reached the majority, the dispute will be resolved.`,
                type: ToastTypes.success,
                duration: 5000,
                id: uuid()
            })
        }
    })



    const speakerEntered = () => {
        if (data.discourse.confirmation[0] === walletAddress || data.discourse.confirmation[1] === walletAddress) {
            return true;
        }
        return false;
    }

    const userIsSpeaker = () => {
        if (data.speakers[0].address === walletAddress || data.speakers[1].address === walletAddress) {
            return true;
        }
        return false;
    }

    const handleJoinMeet = () => {
        setLoading(true);
        if (!userIsSpeaker()) {
            if (token !== "" && !isPast(timeStamp) && propId === data.propID) {
                route.push("/live/" + data.id)
                setLoading(false);
            } else {
                getMeetToken();
            }
        } else {
            if (speakerEntered()) {
                joinMeet();
            } else {
                enterDiscourse();
            }
        }
    }

    const joinMeet = () => {
        if (!tLoading) {
            if (token !== "" && !isPast(timeStamp) && propId === data.propID) {
                route.push("/live/" + data.id)
                setLoading(false);
            } else {
                getMeetToken();
            }
        }
    }

    const enterD = useContractWrite(
        contractData(activeChain?.id!),
        'enterDiscourse',
        {
            args: [data.propId],
            overrides: { from: walletAddress },
            onSettled: (txn) => {
                console.log('submitted:', txn);
                addToast({
                    title: "Transaction Submitted",
                    body: `Waiting for transaction to be mined. Hash: ${txn?.hash}`,
                    type: ToastTypes.wait,
                    duration: 5000,
                    id: uuid()
                })
            },
            onError: (error) => {
                console.log('error:', error);
                addToast({
                    title: "Error Occured",
                    body: error.message,
                    type: ToastTypes.error,
                    duration: 5000,
                    id: uuid()
                })
                setLoading(false);
            }
            
        }
    )

    const waitForTxnEnter = useWaitForTransaction({
        hash: enterD.data?.hash,
        onSettled: (txn) => {
            console.log('settled:', txn);
            addToast({
                title: "Transaction Settled",
                body: `Your attendance has been confirmed for this discourse. You'll be redirected to the meeting in a moment.`,
                type: ToastTypes.success,
                duration: 5000,
                id: uuid()
            })
            enterMeet();
        }
    })

    
    const raiseDis = useContractWrite(
        contractData(activeChain?.id!),
        'raiseDispute',
        {
            args: [data.propId],
            overrides: { from: walletAddress },
            onSettled: (txn) => {
                console.log('submitted:', txn);
            },
            onError: (error) => {
                console.log('error:', error);
            }
        }
    )

    const waitForTxnRaise = useWaitForTransaction({
        hash: raiseDis.data?.hash,
        onSettled: (txn) => {
            console.log('settled:', txn);
            raiseD();
        }
    })
    
    const enterDiscourse = async () => {
        if (activeChain?.id === data.chainId) {
            enterD.write();
        } else {
            addToast({
                title: "Different Chain",
                body: `This discourse is on [${getChainName(data.chainId)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    }
    const raiseDispute = async () => {
        if (activeChain?.id === data.chainId) {
            raiseDis.write();
        } else {
            addToast({
                title: "Different Chain",
                body: `This discourse is on [${getChainName(data.chainId)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    }


    useEffect(() => {
        if (tokenData) {
            setToken(Cookies.get('meetToken')? Cookies.get('meetToken') : tokenData.getMeetToken.token);
            setMPropId(data.propId);
            setMTimeStamp(tokenData.getMeetToken.eat);
            setLoading(false);
            route.push("/live/" + data.id)
        }
    }, [tokenData])



    return (
        <>
            {isMeetHappening() && isPast(d.meet_date) &&
                <div className="bg-card rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <HappeningIconGreen />
                        <p className="text-gradient-g font-Lexend font-bold text-sm">Happening Now</p>
                    </div>
                    <p className="text-[#c6c6c6] text-[10px]">
                        Discourse started at <b>{formatDate(new Date(d.meet_date))}</b> • <b>{getTimeFromDate(new Date(d.meet_date))}</b>
                    </p>
                    {loggedIn && <button onClick={handleJoinMeet} className="button-s flex items-center gap-2 w-max bg-gradient-g">
                        <p className="text-gradient-g text-sm font-Lexend text-[#212427] font-medium">{loading ? 'wait..' : "join"}</p>
                        {!loading && <ArrowRightIcon />}
                    </button>}
                    {
                        !loggedIn &&
                        <p className="text-yellow-200/70 text-[10px] font-medium bg-yellow-200/10 px-2 rounded-md mt-2 py-1">Connect your wallet to join the discourse.</p>
                    }
                </div>
            }

            {isFuture(d.meet_date) &&
                <div className="bg-card rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Clock size='18' color="#c6c6c6" />
                        <p className="text-[#c6c6c6] font-Lexend font-bold text-sm">Scheduled</p>
                    </div>
                    <p className="text-[#c6c6c6] text-[10px]">
                        Discourse scheduled on <b>{formatDate(new Date(d.meet_date))}</b> at <b>{getTimeFromDate(new Date(d.meet_date))}</b>
                    </p>
                </div>
            }

            {
                isPast(d.meet_date) && !isMeetHappening() && discouresEnded(data) &&
                <div className="bg-card rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Verify size='18' color="#ABECD6" />
                        <p className="text-[#ABECD6] font-Lexend text-sm">Happened</p>
                    </div>
                    <p className="text-[#c6c6c6] text-[10px]">
                        Discourse completed on <b>{formatDate(new Date(d.meet_date))}</b>
                    </p>
                    {
                        isDisputable(new Date(d.c_timestamp)) &&
                        <div className="flex items-center">
                            <p className="text-[#797979] font-semibold text-[10px]"></p><button onClick={() => raiseDispute()} className="text-[#FC8181] font-semibold text-[10px] outline-none border-none hover:underline">Raise Dispute </button>
                        </div>
                    }
                </div>
            }
        </>
    );
}

export default JoinMeetCard;