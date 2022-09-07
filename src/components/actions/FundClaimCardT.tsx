import { MessageRemove } from "iconsax-react";
import { useSelector } from "react-redux";
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
                body: `This discourse is on [${getChainName(data.chainId)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    }

    return (
        <div className="bg-card rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-2">
                <MessageRemove size='16' color='#fc8181' />
                <p className="text-[#fc8181] font-Lexend text-sm">Discourse Terminated</p>
            </div>
            <p className="text-[#c6c6c6] text-[10px] mt-2">
                Speakers didn&apos;t confirmed
            </p>
            {
                !loggedIn &&
                <p className="text-yellow-200/70 text-[10px] font-medium bg-yellow-200/10 px-2 rounded-md mt-2 py-1">Connect your wallet to withdraw your fund.</p>
            }
            {
                loggedIn && isPledger(data, walletAddress) && !hasWithdrawn(data, walletAddress) &&
                <>
                    {!loading && <button onClick={handleClaim} className="button-s text-[#c6c6c6] font-Lexend text-sm mt-2">
                        Claim Funds
                    </button>}
                    {loading && <button disabled className="button-s-d text-[#797979] font-Lexend text-sm mt-2">
                        wait..
                    </button>}
                </>
            }

        </div>
    );
}

export default FundClaimCardT;