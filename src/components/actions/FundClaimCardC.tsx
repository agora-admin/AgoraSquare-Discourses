import { MessageRemove, MoneySend } from "iconsax-react";
import { useSelector } from "react-redux";
import { getFundClaimDate, hasWithdrawn, isPledger } from "../../helper/DataHelper";
import { FUND_WITHDRAWN } from "../../lib/mutations";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import { formatDate, isPast } from "../../helper/TimeHelper";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { contractData } from "../../helper/ContractHelper";
import AppContext from "../utils/AppContext";
import { uuid } from "uuidv4";
import { getChainName } from "../../Constants";
import { ToastTypes } from "../../lib/Types";


const FundClaimCardC = ({ data }: { data: any }) => {

    const [loading, setLoading] = useState(false);
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);
    const { activeChain } = useNetwork();

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


    const withdrawPro = useContractWrite(
        contractData(activeChain?.id!),
        'proposerWithdraw',
        {
            args: [data.propId],
            overrides: {
                from: walletAddress
            },
            onSettled: (txn) => {
                console.log('submitted', txn);
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
                    title: "Something went wrong",
                    body: error.message,
                    type: ToastTypes.wait,
                    duration: 5000,
                    id: uuid()
                })
            }
        }
    )

    const withdrawSpeaker = useContractWrite(
        contractData(activeChain?.id!),
        'speakerWithdraw',
        {
            args: [data.propId],
            overrides: {
                from: walletAddress
            },
            onSettled: (txn) => {
                console.log('submitted', txn);
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
                    title: "Something went wrong",
                    body: error.message,
                    type: ToastTypes.wait,
                    duration: 5000,
                    id: uuid()
                })
            }
        }
    )

    const waitForTx1 = useWaitForTransaction({
        hash: withdrawPro.data?.hash,
        onSettled: (txn) => {
            console.log('settled', txn);
            fundWithdrawn();
        }
    })

    const waitForTx2 = useWaitForTransaction({
        hash: withdrawSpeaker.data?.hash,
        onSettled: (txn) => {
            console.log('settled', txn);
            fundWithdrawn();
        }
    })

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
            if (walletAddress === data.prop_starter) {
                withdrawPro.write();
            } else {
                withdrawSpeaker.write();
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
                <MoneySend size='16' color='#ABECD6' />
                <p className="text-[#ABECD6] font-Lexend text-sm">Claim funds</p>
            </div>
            {isPast(getFundClaimDate(data).toISOString()) ?
                <p className="text-[#c6c6c6] text-[10px] mt-2">
                    Fund can be claimed now.
                </p>
                :
                <p className="text-[#c6c6c6] text-[10px] mt-2">
                    You can claim funds after <b>
                        {formatDate(getFundClaimDate(data))}
                    </b>
                </p>
            }
            {
                !loggedIn &&
                <p className="text-yellow-200/70 text-[10px] font-medium bg-yellow-200/10 px-2 rounded-md mt-2 py-1">Connect your wallet to withdraw your fund.</p>
            }
            {
                isPast(getFundClaimDate(data).toISOString()) && !hasWithdrawn(data, walletAddress) &&
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

export default FundClaimCardC;