import LoadingSpinner from "../utils/LoadingSpinner";
import { SpeakerConfirmationIcon } from "../utils/SvgHub";
import { useContext, useState } from "react";
import { formatDate, getTime, getTimeFromDate } from "../../helper/TimeHelper";
import { useMutation, useLazyQuery } from "@apollo/client";
import { SET_WALLETADDRESS, SPEAKER_CONFIRMATION } from "../../lib/mutations";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import DiscourseHub from '../../web3/abi/DiscourseHub.json';
import Addresses from '../../web3/addresses.json';
import Web3 from "web3";
import { ethers } from "ethers";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { contractData } from "../../helper/ContractHelper";
import AppContext from "../utils/AppContext";
import { uuid } from "uuidv4";
import { getChainName } from "../../Constants";
import { ToastTypes } from "../../lib/Types";


const SpeakerConfirmationCard = ({ data }: { data: any }) => {

    const [loading, setLoading] = useState(false);
    const { walletAddress, t_handle, addToast } = useContext(AppContext);
    const { activeChain } = useNetwork();

    const speakerAddressSet = (speakers: any) => {
        if (speakers.length >= 2) {
            const speaker = speakers.find((s: any) => s.username === t_handle);
            if (speaker.address === walletAddress) {
                return true;
            }
        }
        return false;
    }


    const [refetch] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: data.id
        }
    });

    const [setWalletAddress] = useMutation(SET_WALLETADDRESS)

    const [speakerConfirmation] = useMutation(SPEAKER_CONFIRMATION)

    const confirmSpeaker = useContractWrite(
        contractData(activeChain?.id!),
        'speakerConfirmation',
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
                setLoading(false);
                addToast({
                    title: "Error Occured",
                    body: error.message,
                    type: ToastTypes.error,
                    duration: 5000,
                    id: uuid()
                })
            }
        }
    )

    const waitForTxn = useWaitForTransaction(
        {
            hash: confirmSpeaker.data?.hash,
            onSettled: (txn) => {
                console.log('settled:', txn);
                if (txn) {
                    speakerConfirmation({
                        variables: {
                            propId: data.propId,
                            chainId: data.chainId
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
        }
    )

    const handleConfirmation = async () => {
        confirmSpeaker.write();
    }

    const handleClick = async () => {
        if (activeChain?.id === data.chainId) {
            setLoading(true);
            addToast({
                title: "Waiting for confirmation",
                body: `Please wait and do not close the window while the transaction is processing. It may take a few minutes to complete.`,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
            if (speakerAddressSet(data.speakers)) {
                handleConfirmation();
            } else {
                setWalletAddress({
                    variables: {
                        propId: data.propId,
                        chainId: data.chainId
                    },
                    onCompleted: (data) => {
                        handleConfirmation();
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
                body: `This discourse is on [${getChainName(data.chainId)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }

    }


    return (
        <div className="bg-gradient rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-2">
                <SpeakerConfirmationIcon />
                <p className="text-[#212221] font-Lexend font-semibold text-sm">Speaker Confirmation</p>
            </div>
            <p className="text-[#212221] font-medium text-[10px] mt-2">
                You need to confirm your participation before <span className="font-semibold underline">{formatDate(getTime(data.endTS))} • {getTimeFromDate(getTime(data.endTS))}</span>
            </p>
            <div className="flex items-center justify-between">

                {!loading && <button onClick={handleClick} className="button-s w-max mt-2">
                    <p className="text-[10px] text-gradient font-bold">Confirm</p>
                </button>}

                {loading && <button disabled className="button-s-d w-max mt-2">
                    <p className="text-[10px] text-gradient font-bold">Please wait..</p>
                </button>}

                {loading && <LoadingSpinner strokeColor="#212221" />}
            </div>
        </div>
    );
}

export default SpeakerConfirmationCard;