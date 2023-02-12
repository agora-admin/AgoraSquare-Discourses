import { ArrowCircleRight, ProfileCircle } from "iconsax-react";
import { GET_DISCOURSE_BY_ID, GET_TOKEN_BY_ID } from "../../../lib/queries";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLazyQuery, useMutation } from "@apollo/client";
import { ENTER_DISCOURSE, RAISE_DISPUTE } from "../../../lib/mutations";
import { useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { getContractAddressByChainId } from "../../../helper/ContractHelper";
import AppContext from "../../utils/AppContext";
import Cookies from "js-cookie";
import { v4 as uuid } from "uuid";
import { getChainName } from "../../../Constants";
import { ToastTypes } from "../../../lib/Types";
import abi from '../../../web3/abi/DiscourseHub.json';
import { isPast } from "../../../helper/TimeHelper";

const JoinMeetCardIrl = ({ data }: { data: any }) => {
    const route = useRouter();
    const [token, setToken] = useState("");
    const { addToast, walletAddress, setMPropId, setMTimeStamp, timeStamp, propId } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const { chain } = useNetwork();

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

    const handleJoin = () => {
        setLoading(true);
        if (!speakerEntered()) {
            enterDiscourse();
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

    const {config:enterDConfig} = usePrepareContractWrite({
        address: getContractAddressByChainId(chain?.id as number),
        abi,
        functionName: 'enterDiscourse',
        args: [data.propId],
        overrides: { from: walletAddress as any}
    })

    const enterD = useContractWrite({
        ...enterDConfig,
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
    })

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

    const {config:raiseDisConfig} = usePrepareContractWrite({
        address: getContractAddressByChainId(chain?.id as number),
        abi,
        functionName: 'raiseDispute',
        args: [data.propId],
        overrides: { from: walletAddress as any}
    })
    
    const raiseDis = useContractWrite({
        ...raiseDisConfig,
        onSettled: (txn) => {
            console.log('submitted:', txn);
        },
        onError: (error) => {
            console.log('error:', error);
        }
    })

    const waitForTxnRaise = useWaitForTransaction({
        hash: raiseDis.data?.hash,
        onSettled: (txn) => {
            console.log('settled:', txn);
            raiseD();
        }
    })
    
    const enterDiscourse = async () => {
        if (chain?.id === data.chainId) {
            enterD.write?.();
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
        if (chain?.id === data.chainId) {
            raiseDis.write?.();
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
        <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row items-center mobile:gap-4 sm:justify-between py-6 sm:py-3 px-6 bg-[#141414] sm:border-[1.2px] sm:border-[#E5F7FF] rounded-t-[30px] sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="mobile:hidden">
                    <ProfileCircle size="34" color="#84B9D1" variant="Bulk" />
                </div>

                <div className="sm:hidden">
                    <ProfileCircle size="50" color="#84B9D1" variant="Bulk" />
                </div>

                <div className="flex flex-col">
                    <h4 className="text-[#84B9D1] mobile:text-center font-bold text-[13px]">Speaker Attendance</h4>
                    <small className="text-[11px] text-[#E5F7FFE5] mobile:text-center font-semibold">Connect your wallet with your twitter account and confirm your attendance</small>
                </div>
            </div>
            
            <button disabled={loading} onClick={handleJoin} className="flex items-center gap-2 bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                <span className="text-black text-xs font-Lexend font-medium">{loading ? "Please wait..." : "Join"}</span>
                <ArrowCircleRight color="#4F6F7D" variant="Bulk" fill="#000"/>
            </button>
        </div>
    );
}

export default JoinMeetCardIrl;