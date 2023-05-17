import { useContext, useState } from "react";
import { formatDate, getTime, getTimeFromDate } from "../../helper/TimeHelper";
import { useMutation, useLazyQuery } from "@apollo/client";
import { SET_WALLETADDRESS, SPEAKER_CONFIRMATION } from "../../lib/mutations";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import { useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { getContractAddressByChainId } from "../../helper/ContractHelper";
import AppContext from "../utils/AppContext";
import { v4 as uuid } from "uuid";
import { getChainName } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import { ArrowCircleRight, ProfileCircle } from "iconsax-react";
import abi from '../../web3/abi/DiscourseHub.json';

const SpeakerConfirmationCard = ({ discourseData }: { discourseData: any }) => {
    const [loading, setLoading] = useState(false);
    const { walletAddress, t_handle, addToast } = useContext(AppContext);
    const { chain } = useNetwork();

    const isSpeakerAddressSet = (speakers: any) => {
        if (speakers.length >= 2) {
            const speaker = speakers.find((s: any) => s.username === t_handle);
            
            if (speaker && (speaker.address === walletAddress)) {                
                return true;
            }
        }
        return false;
    }

    const [refetch] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: discourseData.id
        }
    });

    const [setWalletAddress] = useMutation(SET_WALLETADDRESS)
    const [speakerConfirmation] = useMutation(SPEAKER_CONFIRMATION)

    const {config} = usePrepareContractWrite({
        address: getContractAddressByChainId(chain?.id as number),
        abi,
        functionName: 'speakerConfirmation',
        args: [discourseData.propId],
        overrides: { from: walletAddress as any },
    })

    const confirmSpeaker = useContractWrite({
        ...config,
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
            setLoading(false);
            addToast({
                title: "Error Occured",
                body: error.message,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    })

    const waitForTxn = useWaitForTransaction({
        hash: confirmSpeaker.data?.hash,
        confirmations: 5,
        onSettled: (txn) => {
            console.log('settled:', txn);
            if (txn) {
                speakerConfirmation({
                    variables: {
                        propId: discourseData.propId,
                        chainId: discourseData.chainId
                    },
                    onCompleted: () => {
                        setLoading(false);
                        addToast({
                            title: "Confirmation successful",
                            body: `You have confirmed your participation in the discussion.`,
                            type: ToastTypes.success,
                            duration: 5000,
                            id: uuid()
                        })
                        refetch();
                    },
                    onError: (error) => {
                        setLoading(false);
                        addToast({
                            title: "Something went wrong",
                            body: `Please try again later. If the problem persists, please contact us.`,
                            type: ToastTypes.error,
                            duration: 5000,
                            id: uuid()
                        })
                        console.log('Something went wrong', error);
                    }
                })
            }
        }
    })

    const handleConfirmation = async () => {
        confirmSpeaker.write?.();
    }

    const handleClick = async () => {
        if (chain?.id === discourseData.chainId) {
            setLoading(true);
            addToast({
                title: "Waiting for confirmation",
                body: `Please wait and do not close the window while the transaction is processing. It may take a few minutes to complete.`,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
            
            if (isSpeakerAddressSet(discourseData.speakers)) {
                handleConfirmation();
            } else {
                setWalletAddress({
                    variables: {
                        propId: discourseData.propId,
                        chainId: discourseData.chainId
                    },
                    onCompleted: (data) => {
                        console.log("setWalletAddress Completed: ",data);
                        location.reload();
                    },
                    onError: (error) => {
                        console.log('Something went wrong', error);
                        addToast({
                            title: "Something went wrong",
                            body: `Please try again later. If the problem persists, please contact us.`,
                            type: ToastTypes.error,
                            duration: 5000,
                            id: uuid()
                        })
                        setLoading(false);
                    }
                })
            }
        } else {
            addToast({
                title: "Chain Error",
                body: `This discourse is on [${getChainName(discourseData.chainId)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    }

    return (
        <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row items-center mobile:gap-4 sm:justify-between py-6 sm:py-3 px-6 bg-[#141414] sm:border-[1.2px] sm:border-[#E5F7FF] rounded-t-[30px] sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="mobile:hidden">
                    <ProfileCircle size="34" color="#84B9D1" variant="Bulk" />
                </div>

                <div className="sm:hidden">
                    <ProfileCircle size="50" color="#84B9D1" variant="Bulk" />
                </div>

                { !isSpeakerAddressSet(discourseData.speakers) &&
                <div className="flex flex-col">
                    <h4 className="text-[#84B9D1] mobile:text-center font-bold text-[13px]">Speaker Confirmation Step 1 of 2</h4>
                    <small className="text-[11px] text-[#E5F7FFE5] mobile:text-center font-semibold">Connect your wallet with your twitter account and confirm your participation before <span className="font-semibold underline">{formatDate(getTime(discourseData.endTS))} • {getTimeFromDate(getTime(discourseData.endTS))}</span></small>
                </div>
                }
                { isSpeakerAddressSet(discourseData.speakers) &&
                <div className="flex flex-col">
                    <h4 className="text-[#84B9D1] mobile:text-center font-bold text-[13px]">Speaker Confirmation Step 2 of 2</h4>
                    <small className="text-[11px] text-[#E5F7FFE5] mobile:text-center font-semibold">Please confirm transaction from your wallet to complete speaker confirmation</small>
                </div>
                }
            </div>
            
            { !isSpeakerAddressSet(discourseData.speakers) &&
            <button disabled={loading} onClick={handleClick} className="flex items-center gap-2 bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                <span className="text-black text-xs font-Lexend font-medium">{loading ? "Please wait..." : "Confirm"}</span>
                <ArrowCircleRight color="#4F6F7D" variant="Bulk" fill="#000"/>
            </button>
            }
            { isSpeakerAddressSet(discourseData.speakers) &&
            <button disabled={loading} onClick={handleClick} className="flex items-center gap-2 bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                <span className="text-black text-xs font-Lexend font-medium">{loading ? "Please wait..." : "Confirm Transaction"}</span>
                <ArrowCircleRight color="#4F6F7D" variant="Bulk" fill="#000"/>
            </button>
            }
        </div>
    );
}

export default SpeakerConfirmationCard;