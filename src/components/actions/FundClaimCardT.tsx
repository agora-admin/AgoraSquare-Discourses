import { ArrowCircleRight, Danger } from "iconsax-react";
import { hasWithdrawn, isPledger } from "../../helper/DataHelper";
import { TERMINATE_PROPOSAL, FUND_WITHDRAWN } from "../../lib/mutations";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { contractData } from "../../helper/ContractHelper";
import AppContext from "../utils/AppContext";
import { getChainName } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import { uuid } from "uuidv4";
import {toast} from 'react-toastify';

const FundClaimCardT = ({ data }: { data: any }) => {

    const [loading, setLoading] = useState(false);
    const [needTermination, setNeedTermination] = useState(false);
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);
    const { activeChain } = useNetwork();

    const [terminateProposal] = useMutation(TERMINATE_PROPOSAL, {
        variables: {
            propId: data.propId,
            chainId: data.chainId
        },
        onCompleted: () => {
            refetch();
            addToast({
                title: "Widraw Successful",
                body: `You have successfully claimed your funds. It may take a few minutes to reflect in your wallet.`,
                type: ToastTypes.success,
                duration: 5000,
                id: uuid()
            })
        },
        onError: (error) => {
            console.log(error);
            setLoading(false);
            addToast({
                title: "Something went wrong",
                body: 'Please try again later. If the problem persists, please contact us.',
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
        }
    });

    const [fundWithdrawn] = useMutation(FUND_WITHDRAWN, {
        variables: {
            propId: data.propId,
            chainId: data.chainId
        },
        onCompleted: () => {
            refetch();
            addToast({
                title: "Widraw Successful",
                body: `You have successfully claimed your funds. It may take a few minutes to reflect in your wallet.`,
                type: ToastTypes.success,
                duration: 5000,
                id: uuid()
            })
        }
    })

    const [refetch] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: data.id
        }, onCompleted: (data) => {
            setLoading(false);
        }
    })

    const withdrawP = useContractWrite(
        contractData(activeChain?.id!),
        'withdrawPledge',
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
                console.log(error);
                addToast({
                    title: "Something went wrong",
                    body: error.message,
                    type: ToastTypes.wait,
                    duration: 5000,
                    id: uuid()
                })
            }
        }
    )

    const waitForWithdrawl = useWaitForTransaction({
        hash: withdrawP.data?.hash,
        onSettled: (txn) => {
            fundWithdrawn();
        }
    })

    useEffect(() => {
        if (data.status.terminated && needTermination && withdrawP.status === 'idle') {
            withdrawP.write();
        }
    }, [data, needTermination, withdrawP])

    const handleClaim = async () => {
        if (activeChain?.id === data.chainId) {         
            setLoading(true);
            addToast({
                title: "Waiting for confirmation",
                body: `Please approve the transaction on your wallet. It may take a few minutes to complete.`,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
            if (!data.status.terminated) {
                setNeedTermination(true);
                terminateProposal();
            } else {
                withdrawP.write();
            }
        } else {
            addToast({
                title: "Different Chain",
                body: `This discourse is on ${getChainName(data.chainId)}. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    }

    return (
        <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row mobile:gap-4 items-center sm:justify-between py-6 sm:py-3 sm:px-4 bg-[#141414] sm:border-[1.2px] sm:border-[#FCB4BD] rounded-t-[30px] sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="mobile:hidden">
                    <Danger variant="Bulk" color="#FCB4BD" size={40}/>
                </div>

                <div className="sm:hidden">
                    <Danger variant="Bulk" color="#FCB4BD" size={50}/>
                </div>
                <div className="flex flex-col">
                    <h4 className="text-[#FCB4BD] font-bold text-[13px] sm:text-sm">Discourse Terminated</h4>
                    <small className="text-[11px] sm:text-xs text-[#E5F7FFE5] font-semibold">Speaker didn&apos;t confirmed</small>
                    {!loggedIn && <small className="text-[11px] text-[#E5F7FFE5] font-semibold">Connect your wallet to withdraw your fund.</small>}
                </div>
            </div>

            {loggedIn && isPledger(data, walletAddress) && !hasWithdrawn(data, walletAddress) && 
                <button disabled={loading} onClick={handleClaim} className="flex items-center gap-2 bg-[#FCB4BD] rounded-2xl p-3 cursor-pointer">
                    <span className="text-black text-xs font-Lexend font-medium">{loading ? "wait..." : "withdraw funds"}</span>
                    <ArrowCircleRight color="#976C71" variant="Bulk" fill="#000"/>
                </button>
            }
        </div>
    );
}

export default FundClaimCardT;